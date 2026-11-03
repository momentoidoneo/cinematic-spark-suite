import { createContext, useContext, type ReactNode } from "react";

// Only anonymous, published content from the explicit build-time allowlist.
// Never put sessions, credentials, leads or admin configuration in this snapshot.
export type PublicTables = Record<string, unknown[]>;
export type PageHead = { title: string; description: string; canonical?: string; ogType?: string; ogImage?: string; noindex?: boolean; jsonLd?: Record<string, unknown> | Record<string, unknown>[] };
type PublicContext = { tables: PublicTables; collectHead?: (head: PageHead) => void };
const Context = createContext<PublicContext>({ tables: {} });
export function PublicContentProvider({ tables, collectHead, children }: PublicContext & { children: ReactNode }) {
  return <Context.Provider value={{ tables, collectHead }}>{children}</Context.Provider>;
}
export function usePublicRows<T>(table: string): T[] {
  return (useContext(Context).tables[table] || []) as T[];
}
export function usePublicHeadCollector() { return useContext(Context).collectHead; }
export function readPublicSnapshot(): PublicTables {
  if (typeof document === "undefined") return {};
  try {
    const text = document.getElementById("sc-public-content")?.textContent;
    return text ? JSON.parse(text) : {};
  } catch { return {}; }
}
