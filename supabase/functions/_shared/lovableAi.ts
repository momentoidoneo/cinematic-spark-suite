export const LOVABLE_AI_GATEWAY_URL =
  "https://ai.gateway.lovable.dev/v1/chat/completions";

type JsonRecord = Record<string, unknown>;

export class LovableGatewayError extends Error {
  status: number;
  details: string;

  constructor(status: number, details: string) {
    super(`Lovable AI Gateway error [${status}]: ${details.slice(0, 500)}`);
    this.name = "LovableGatewayError";
    this.status = status;
    this.details = details;
  }
}

export async function callLovableChat(apiKey: string, payload: JsonRecord) {
  const response = await fetch(LOVABLE_AI_GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new LovableGatewayError(
      response.status,
      details || response.statusText || "unknown error",
    );
  }

  return await response.json();
}

export function isLovableStatus(error: unknown, status: number) {
  return error instanceof LovableGatewayError && error.status === status;
}

function normalizeContentPart(part: unknown): string {
  if (typeof part === "string") return part;
  if (!part || typeof part !== "object") return "";
  const record = part as JsonRecord;

  for (const key of ["text", "content", "output_text"]) {
    const value = record[key];
    if (typeof value === "string") return value;
    if (Array.isArray(value)) {
      return value.map(normalizeContentPart).filter(Boolean).join("\n");
    }
  }

  return "";
}

export function getAssistantText(data: unknown): string {
  const choice = (data as any)?.choices?.[0];
  const message = choice?.message ?? choice?.delta ?? (data as any)?.message ??
    {};
  const content = message?.content ?? message?.text ??
    (data as any)?.output_text ?? "";

  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map(normalizeContentPart).filter(Boolean).join("\n");
  }
  if (content && typeof content === "object") {
    return normalizeContentPart(content);
  }
  return "";
}

export function stripJsonCodeFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function extractBetween(text: string, open: "{" | "[", close: "}" | "]") {
  const start = text.indexOf(open);
  const end = text.lastIndexOf(close);
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return null;
}

export function parseJsonFromText<T = unknown>(
  text: string,
  expected: "object" | "array" | "any" = "any",
): T {
  const clean = stripJsonCodeFences(text);
  try {
    return JSON.parse(clean) as T;
  } catch {
    // Continue with extracted candidates.
  }

  const candidates: string[] = [];
  if (expected === "array" || expected === "any") {
    const arrayCandidate = extractBetween(clean, "[", "]");
    if (arrayCandidate) candidates.push(arrayCandidate);
  }
  if (expected === "object" || expected === "any") {
    const objectCandidate = extractBetween(clean, "{", "}");
    if (objectCandidate) candidates.push(objectCandidate);
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as T;
    } catch {
      // Try the next candidate.
    }
  }

  throw new Error("La IA no devolvió JSON válido");
}

export function getFirstToolArguments<T = unknown>(data: unknown): T | null {
  const toolCall = (data as any)?.choices?.[0]?.message?.tool_calls?.[0];
  const args = toolCall?.function?.arguments;
  if (!args) return null;
  if (typeof args === "string") return JSON.parse(args) as T;
  return args as T;
}

function pushIfImageUrl(candidates: string[], value: unknown) {
  if (typeof value !== "string") return;
  const trimmed = value.trim();
  if (
    /^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(trimmed) ||
    /^https:\/\/.+/i.test(trimmed)
  ) {
    candidates.push(trimmed);
  }
}

function collectImageCandidates(
  value: unknown,
  candidates: string[] = [],
): string[] {
  if (!value || typeof value !== "object") return candidates;
  if (Array.isArray(value)) {
    for (const item of value) collectImageCandidates(item, candidates);
    return candidates;
  }

  const record = value as JsonRecord;
  const type = String(record.type ?? "").toLowerCase();

  if (record.image_url && typeof record.image_url === "object") {
    pushIfImageUrl(candidates, (record.image_url as JsonRecord).url);
  }
  if (type.includes("image")) {
    pushIfImageUrl(candidates, record.url);
    pushIfImageUrl(candidates, record.data);
    if (record.source && typeof record.source === "object") {
      pushIfImageUrl(candidates, (record.source as JsonRecord).url);
      const sourceData = (record.source as JsonRecord).data;
      if (typeof sourceData === "string" && !sourceData.startsWith("data:")) {
        const mediaType = String(
          (record.source as JsonRecord).media_type ?? "image/png",
        );
        pushIfImageUrl(candidates, `data:${mediaType};base64,${sourceData}`);
      }
    }
  }

  for (const key of ["images", "content"]) {
    collectImageCandidates(record[key], candidates);
  }

  return candidates;
}

export function extractImageUrl(data: unknown): string | null {
  const message = (data as any)?.choices?.[0]?.message ?? {};
  const direct = message?.images?.[0]?.image_url?.url ??
    message?.image_url?.url;
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  const candidates = collectImageCandidates(message);
  if (candidates.length > 0) return candidates[0];

  const text = getAssistantText(data);
  const dataUrlMatch = text.match(
    /data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=_-]+/,
  );
  return dataUrlMatch?.[0] ?? null;
}

function extensionForContentType(contentType: string): string {
  const normalized = contentType.split(";")[0].trim().toLowerCase();
  if (normalized === "image/jpeg" || normalized === "image/jpg") return "jpg";
  if (normalized === "image/webp") return "webp";
  if (normalized === "image/gif") return "gif";
  if (normalized === "image/avif") return "avif";
  return "png";
}

export async function imageUrlToBytes(
  imageUrl: string,
): Promise<{ bytes: Uint8Array; contentType: string; extension: string }> {
  const dataUrlMatch = imageUrl.match(
    /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s,
  );
  if (dataUrlMatch) {
    const contentType = dataUrlMatch[1].toLowerCase();
    const base64 = dataUrlMatch[2].replace(/\s/g, "");
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return {
      bytes,
      contentType,
      extension: extensionForContentType(contentType),
    };
  }

  if (!/^https:\/\//i.test(imageUrl)) {
    throw new Error("La IA devolvió una imagen con formato no soportado");
  }

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`No se pudo descargar la imagen IA [${response.status}]`);
  }
  const contentType =
    response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() ||
    "image/png";
  if (!contentType.startsWith("image/")) {
    throw new Error(`La URL IA no devolvió una imagen (${contentType})`);
  }
  return {
    bytes: new Uint8Array(await response.arrayBuffer()),
    contentType,
    extension: extensionForContentType(contentType),
  };
}
