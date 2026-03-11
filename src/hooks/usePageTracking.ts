import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Records a page view on every route change (public pages only).
 * Excludes: admin routes, logged-in users, and traffic from Lovable preview/editor.
 */
const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Skip admin routes
    if (location.pathname.startsWith("/admin") || location.pathname === "/login") return;

    // Skip Lovable preview/editor traffic
    const ref = document.referrer || "";
    const host = window.location.hostname || "";
    if (
      ref.includes("lovable.dev") ||
      ref.includes("lovableproject.com") ||
      host.includes("lovableproject.com") ||
      host.includes("id-preview--")
    ) return;

    const record = async () => {
      try {
        // Skip if user is authenticated (admin)
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) return;

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
