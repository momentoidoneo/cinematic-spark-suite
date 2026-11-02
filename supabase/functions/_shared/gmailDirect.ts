// Server-only transport. This module must never be imported by browser code.
// Only owner notifications are supported; it cannot address arbitrary recipients.
export const OWNER_EMAIL = "silvio@silviocosta.net";
export const GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";

export type GmailConfig = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
};

export type OwnerNotification = {
  subject: string;
  html: string;
  replyTo?: string;
  reference: string;
};

export class GmailDeliveryError extends Error {
  constructor(
    public readonly stage: "configuration" | "oauth" | "send",
    public readonly delivery: "not_attempted" | "rejected" | "unknown",
    public readonly status?: number,
  ) {
    // Never include token responses, credentials, message content or addresses.
    super(`gmail_${stage}_${delivery}${status ? `_${status}` : ""}`);
    this.name = "GmailDeliveryError";
  }
}

export const gmailConfigFromEnv = (
  read: (name: string) => string | undefined,
): GmailConfig => {
  const config = {
    clientId: read("GMAIL_CLIENT_ID")?.trim() || "",
    clientSecret: read("GMAIL_CLIENT_SECRET")?.trim() || "",
    refreshToken: read("GMAIL_REFRESH_TOKEN")?.trim() || "",
  };
  if (!config.clientId || !config.clientSecret || !config.refreshToken) {
    throw new GmailDeliveryError("configuration", "not_attempted");
  }
  return config;
};

const base64Utf8 = (value: string): string => {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  // Avoid argument-size limits for email bodies.
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
};

const encodedSubject = (subject: string): string => {
  const words: string[] = [];
  let chunk = "";
  for (const character of subject) {
    if (new TextEncoder().encode(chunk + character).length > 36) {
      words.push(`=?UTF-8?B?${base64Utf8(chunk)}?=`);
      chunk = "";
    }
    chunk += character;
  }
  if (chunk) words.push(`=?UTF-8?B?${base64Utf8(chunk)}?=`);
  return words.join("\r\n ");
};

export const buildOwnerMime = (notice: OwnerNotification): string => {
  if (!notice.subject || /[\r\n]/.test(notice.subject) ||
    !/^[a-z0-9.-]{1,120}$/i.test(notice.reference) ||
    (notice.replyTo && !/^[^\s<>"(),;:\\]+@[^\s<>"(),;:\\]+\.[^\s<>"(),;:\\]+$/.test(notice.replyTo))) {
    throw new GmailDeliveryError("configuration", "not_attempted");
  }
  const headers = [
    `From: Silvio Costa <${OWNER_EMAIL}>`,
    `To: ${OWNER_EMAIL}`,
    `Subject: ${encodedSubject(notice.subject)}`,
    `Message-ID: <${notice.reference}@silviocosta.net>`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
  ];
  if (notice.replyTo) headers.push(`Reply-To: ${notice.replyTo}`);
  const body = base64Utf8(notice.html).match(/.{1,76}/g)?.join("\r\n") || "";
  return base64Utf8(`${headers.join("\r\n")}\r\n\r\n${body}`)
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

export const sendOwnerGmail = async (
  config: GmailConfig,
  notice: OwnerNotification,
  fetcher: typeof fetch = fetch,
): Promise<{ provider: "gmail"; messageId: string }> => {
  if (!config.clientId || !config.clientSecret || !config.refreshToken) {
    throw new GmailDeliveryError("configuration", "not_attempted");
  }
  const raw = buildOwnerMime(notice);
  let tokenResponse: Response;
  try {
    tokenResponse = await fetcher("https://oauth2.googleapis.com/token", {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: config.refreshToken,
        grant_type: "refresh_token",
      }),
    });
  } catch {
    throw new GmailDeliveryError("oauth", "not_attempted");
  }
  if (!tokenResponse.ok) {
    throw new GmailDeliveryError("oauth", "not_attempted", tokenResponse.status);
  }
  const token = await tokenResponse.json().catch(() => null);
  if (!token || typeof token.access_token !== "string" || !token.access_token ||
    (token.scope && !String(token.scope).split(/\s+/).includes(GMAIL_SEND_SCOPE))) {
    throw new GmailDeliveryError("oauth", "not_attempted");
  }

  let response: Response;
  try {
    response = await fetcher("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(15_000),
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token.access_token}` },
      body: JSON.stringify({ raw }),
    });
  } catch {
    // A timeout may occur after Gmail accepts the message. Never blindly retry.
    throw new GmailDeliveryError("send", "unknown");
  }
  if (!response.ok) {
    throw new GmailDeliveryError("send", response.status >= 500 ? "unknown" : "rejected", response.status);
  }
  const result = await response.json().catch(() => null);
  if (!result || typeof result.id !== "string" || !result.id.trim()) {
    throw new GmailDeliveryError("send", "unknown");
  }
  // Provider acceptance is not proof of inbox delivery; verify delivery separately.
  return { provider: "gmail", messageId: result.id };
};

export const escapeEmailHtml = (value: string) => value
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
