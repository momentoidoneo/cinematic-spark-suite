export type AIReferral = {
  source: string;
  label: string;
  host?: string;
};

const AI_REFERRERS: Array<{ source: string; label: string; hosts: string[] }> = [
  { source: "chatgpt", label: "ChatGPT", hosts: ["chatgpt.com", "chat.openai.com"] },
  { source: "perplexity", label: "Perplexity", hosts: ["perplexity.ai"] },
  { source: "gemini", label: "Gemini", hosts: ["gemini.google.com", "bard.google.com"] },
  { source: "copilot", label: "Microsoft Copilot", hosts: ["copilot.microsoft.com", "bing.com/chat"] },
  { source: "claude", label: "Claude", hosts: ["claude.ai"] },
  { source: "poe", label: "Poe", hosts: ["poe.com"] },
  { source: "you", label: "You.com", hosts: ["you.com"] },
  { source: "phind", label: "Phind", hosts: ["phind.com"] },
  { source: "mistral", label: "Mistral", hosts: ["mistral.ai", "chat.mistral.ai"] },
  { source: "arc", label: "Arc Search", hosts: ["arc.net"] },
];

const normalizeHost = (value: string) => value.toLowerCase().replace(/^www\./, "");

export const detectAIReferrer = (referrer?: string | null): AIReferral | null => {
  if (!referrer) return null;

  let host = "";
  try {
    const url = new URL(referrer);
    host = normalizeHost(`${url.hostname}${url.pathname === "/" ? "" : url.pathname}`);
  } catch {
    host = normalizeHost(referrer);
  }

  const match = AI_REFERRERS.find((entry) =>
    entry.hosts.some((candidate) => host === candidate || host.startsWith(`${candidate}/`) || host.endsWith(`.${candidate}`)),
  );

  return match ? { source: match.source, label: match.label, host } : null;
};

export const detectAIAttribution = ({
  referrer,
  utm_source,
  utm_medium,
}: {
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
}): AIReferral | null => {
  const fromReferrer = detectAIReferrer(referrer);
  if (fromReferrer) return fromReferrer;

  if (utm_medium !== "ai_search" || !utm_source) return null;
  const source = normalizeHost(utm_source);
  const match = AI_REFERRERS.find((entry) => entry.source === source || entry.hosts.includes(source));
  return {
    source,
    label: match?.label || utm_source,
  };
};

export const getAIReferralLabels = () => AI_REFERRERS.map(({ source, label }) => ({ source, label }));
