import { supabase } from "@/integrations/supabase/client";
import { detectAIAttribution } from "@/lib/aiReferrers";

export type Period = "today" | "7d" | "30d" | "90d" | "all";

export interface PageViewRow {
  id: string;
  page_path: string;
  referrer: string | null;
  user_agent: string | null;
  created_at: string;
  country: string | null;
  city: string | null;
  region: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  session_id: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  duration_seconds: number | null;
}

export interface ContactMessageMetricRow {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean | null;
  created_at: string;
}

export const periodToHours = (p: Period): number => {
  switch (p) {
    case "today":
      return 24;
    case "7d":
      return 24 * 7;
    case "30d":
      return 24 * 30;
    case "90d":
      return 24 * 90;
    case "all":
      return 24 * 365 * 5;
  }
};

export const periodLabel: Record<Period, string> = {
  today: "Hoy",
  "7d": "7 días",
  "30d": "30 días",
  "90d": "90 días",
  all: "Todo",
};

export const fetchViews = async (sinceIso: string): Promise<PageViewRow[]> => {
  const { data, error } = await supabase
    .from("page_views")
    .select(
      "id,page_path,referrer,user_agent,created_at,country,city,region,utm_source,utm_medium,utm_campaign,session_id,device_type,browser,os,duration_seconds",
    )
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) throw error;
  return (data || []) as PageViewRow[];
};

const DEMO_EMAIL_DOMAINS = [
  "example.com",
  "example.es",
  "test.com",
  "test.es",
  "demo.com",
  "demo.es",
  "mailinator.com",
  "tempmail.com",
];

const DEMO_EMAIL_PREFIXES = ["test", "demo", "prueba", "asdf", "qwerty", "lovable"];

export const isLikelyDemoLead = (row: Pick<ContactMessageMetricRow, "name" | "email" | "message">) => {
  const email = row.email.trim().toLowerCase();
  const emailLocal = email.split("@")[0] || "";
  const text = `${row.name} ${row.message}`.toLowerCase();

  return (
    DEMO_EMAIL_DOMAINS.some((domain) => email.endsWith(`@${domain}`)) ||
    DEMO_EMAIL_PREFIXES.includes(emailLocal) ||
    /\b(lorem ipsum|mensaje de prueba|esto es una prueba|demo lead|test lead|prueba dashboard)\b/i.test(text)
  );
};

export const fetchRealContactMessages = async (sinceIso?: string): Promise<ContactMessageMetricRow[]> => {
  let query = supabase
    .from("contact_messages")
    .select("id,name,email,message,is_read,created_at")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (sinceIso) query = query.gte("created_at", sinceIso);

  const { data, error } = await query;
  if (error) throw error;
  return ((data || []) as ContactMessageMetricRow[]).filter((row) => !isLikelyDemoLead(row));
};

export const groupByDay = (rows: PageViewRow[], days: number) => {
  const now = Date.now();
  const map: Record<string, number> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000);
    map[d.toISOString().slice(0, 10)] = 0;
  }
  rows.forEach((r) => {
    const key = r.created_at.slice(0, 10);
    if (key in map) map[key]++;
  });
  return Object.entries(map).map(([key, views]) => ({
    day: new Date(key).toLocaleDateString("es-ES", { weekday: "short", day: "numeric" }),
    date: key,
    views,
  }));
};

export const uniqueSessions = (rows: PageViewRow[]) =>
  new Set(rows.map((r) => r.session_id || r.user_agent || "anon")).size;

export const topBy = <K extends keyof PageViewRow>(rows: PageViewRow[], key: K, limit = 10) => {
  const counts: Record<string, number> = {};
  rows.forEach((r) => {
    const v = (r[key] as string) || "(desconocido)";
    counts[v] = (counts[v] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
};

export const referrerHost = (ref: string | null): string => {
  if (!ref) return "Directo";
  try {
    return new URL(ref).hostname.replace(/^www\./, "");
  } catch {
    return ref;
  }
};

export const aiReferralSource = (row: Pick<PageViewRow, "referrer" | "utm_source" | "utm_medium">) =>
  detectAIAttribution({
    referrer: row.referrer,
    utm_source: row.utm_source,
    utm_medium: row.utm_medium,
  });

export const topAIReferrers = (rows: PageViewRow[], limit = 8) => {
  const counts: Record<string, { label: string; count: number }> = {};
  rows.forEach((row) => {
    const source = aiReferralSource(row);
    if (!source) return;
    counts[source.source] = counts[source.source] || { label: source.label, count: 0 };
    counts[source.source].count++;
  });

  return Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(({ label: name, count }) => ({ name, count }));
};

export const aiReferralCount = (rows: PageViewRow[]) =>
  rows.reduce((count, row) => count + (aiReferralSource(row) ? 1 : 0), 0);

export const exportCSV = (rows: Record<string, unknown>[], filename: string) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      headers
        .map((h) => {
          const v = r[h];
          if (v == null) return "";
          const s = String(v).replace(/"/g, '""');
          return /[",\n]/.test(s) ? `"${s}"` : s;
        })
        .join(","),
    ),
  ].join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const pctChange = (curr: number, prev: number): number | undefined => {
  if (prev === 0) return curr > 0 ? undefined : 0;
  return ((curr - prev) / prev) * 100;
};

export const buildHeatmap = (rows: PageViewRow[]) => {
  // 7 days x 24 hours
  const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  rows.forEach((r) => {
    const d = new Date(r.created_at);
    grid[d.getDay()][d.getHours()]++;
  });
  return grid;
};
