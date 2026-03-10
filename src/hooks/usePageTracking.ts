import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Records a page view on every route change (public pages only).
 * Generates a simple hash from the IP via the Supabase anon header.
 */
const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Skip admin routes
    if (location.pathname.startsWith("/admin") || location.pathname === "/login") return;

    const record = async () => {
      try {
        await supabase.from("page_views").insert({
          page_path: location.pathname,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent || null,
        });
      } catch {
        // Silently fail - analytics should never break the app
      }
    };

    // Small delay to avoid recording navigations that immediately redirect
    const timer = setTimeout(record, 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);
};

export default usePageTracking;
