import { usePublicRows } from "@/seo/PublicContent";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SEOOverride {
  title: string | null;
  description: string | null;
  og_image: string | null;
}

const cache = new Map<string, SEOOverride | null>();

export function useSEOMetadata(pagePath: string): SEOOverride | null {
  const initial = usePublicRows<SEOOverride & { page_path: string }>("seo_metadata").find(row => row.page_path === pagePath);
  const [data, setData] = useState<SEOOverride | null>(cache.get(pagePath) ?? initial ?? null);

  useEffect(() => {
    if (cache.has(pagePath)) {
      setData(cache.get(pagePath) ?? null);
      return;
    }

    let cancelled = false;
    supabase
      .from("seo_metadata")
      .select("title, description, og_image")
      .eq("page_path", pagePath)
      .maybeSingle()
      .then(({ data: row }) => {
        if (cancelled) return;
        const val = row as SEOOverride | null;
        cache.set(pagePath, val);
        setData(val);
      });

    return () => { cancelled = true; };
  }, [pagePath]);

  return data;
}
