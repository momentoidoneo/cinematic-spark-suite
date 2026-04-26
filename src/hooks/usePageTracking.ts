import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Records a page view + session + UTM + geo + device data.
 * Excludes admin routes, logged-in users and Lovable preview/editor traffic.
 */

const SESSION_KEY = "sc_session_id";
const SESSION_TS_KEY = "sc_session_ts";
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 min idle = new session
const GEO_CACHE_KEY = "sc_geo_cache";

interface GeoCache {
  country?: string;
  city?: string;
  region?: string;
  ts: number;
}

const getOrCreateSessionId = (): string => {
  try {
    const now = Date.now();
    const existing = sessionStorage.getItem(SESSION_KEY);
    const ts = parseInt(sessionStorage.getItem(SESSION_TS_KEY) || "0", 10);
    if (existing && now - ts < SESSION_TTL_MS) {
      sessionStorage.setItem(SESSION_TS_KEY, String(now));
      return existing;
    }
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? `s_${crypto.randomUUID()}`
      : `s_${now}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, id);
    sessionStorage.setItem(SESSION_TS_KEY, String(now));
    return id;
  } catch {
    return `s_${Date.now()}`;
  }
};

const detectDevice = (): { device_type: string; browser: string; os: string; screen_size: string } => {
  const ua = navigator.userAgent;
  const w = window.screen.width;
  const device_type = /Mobi|Android|iPhone/i.test(ua) ? "mobile" : /iPad|Tablet/i.test(ua) ? "tablet" : "desktop";
  let browser = "other";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) browser = "Chrome";
  else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) browser = "Safari";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  let os = "other";
  if (/Windows/.test(ua)) os = "Windows";
  else if (/Mac OS X|Macintosh/.test(ua)) os = "macOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iOS/.test(ua)) os = "iOS";
  else if (/Linux/.test(ua)) os = "Linux";
  return { device_type, browser, os, screen_size: `${w}x${window.screen.height}` };
};

const getUTMParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || null,
    utm_medium: params.get("utm_medium") || null,
    utm_campaign: params.get("utm_campaign") || null,
    utm_term: params.get("utm_term") || null,
    utm_content: params.get("utm_content") || null,
  };
};

const fetchGeo = async (): Promise<{ country?: string; city?: string; region?: string }> => {
  try {
    const cached = localStorage.getItem(GEO_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as GeoCache;
      // Cache 24h
      if (Date.now() - parsed.ts < 24 * 60 * 60 * 1000) {
        return { country: parsed.country, city: parsed.city, region: parsed.region };
      }
    }
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) return {};
    const data = await res.json();
    const geo = {
      country: data.country_name || undefined,
      city: data.city || undefined,
      region: data.region || undefined,
    };
    localStorage.setItem(GEO_CACHE_KEY, JSON.stringify({ ...geo, ts: Date.now() }));
    return geo;
  } catch {
    return {};
  }
};

const usePageTracking = () => {
  const location = useLocation();
  const lastViewIdRef = useRef<string | null>(null);
  const lastSessionIdRef = useRef<string | null>(null);
  const arrivedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    if (location.pathname.startsWith("/admin") || location.pathname === "/login") return;

    const ref = document.referrer || "";
    const host = window.location.hostname || "";
    if (
      ref.includes("lovable.dev") ||
      ref.includes("lovableproject.com") ||
      host.includes("lovableproject.com") ||
      host.includes("id-preview--")
    )
      return;

    let cancelled = false;

    const finishCurrentView = async (isExit = false) => {
      if (!lastViewIdRef.current || !lastSessionIdRef.current) return;

      const duration = Math.round((Date.now() - arrivedAtRef.current) / 1000);
      await supabase.functions.invoke("track-page-view", {
        body: {
          action: "finish",
          id: lastViewIdRef.current,
          session_id: lastSessionIdRef.current,
          duration_seconds: duration,
          is_exit: isExit,
        },
      });
    };

    const record = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) return;

        await finishCurrentView();

        const session_id = getOrCreateSessionId();
        const device = detectDevice();
        const utm = getUTMParams();
        const geo = await fetchGeo();
        if (cancelled) return;

        const { data, error } = await supabase.functions.invoke<{ id: string }>("track-page-view", {
          body: {
            action: "start",
            page_path: location.pathname,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent || null,
            session_id,
            ...device,
            ...utm,
            ...geo,
          },
        });

        if (!error && data?.id) {
          lastViewIdRef.current = data.id;
          lastSessionIdRef.current = session_id;
          arrivedAtRef.current = Date.now();
        }
      } catch {
        /* silent */
      }
    };

    const timer = setTimeout(record, 300);

    // Best-effort duration update on tab hidden (works mid-session for SPA navs above already)
    const handleVisibility = () => {
      if (document.visibilityState !== "hidden" || !lastViewIdRef.current) return;
      finishCurrentView(true).catch(() => {});
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [location.pathname]);
};

export default usePageTracking;
