import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const TRACKING_KEYS = [
  "google_tag_manager_id",
  "google_tag_manager_enabled",
  "google_analytics_id",
  "google_analytics_enabled",
  "google_ads_id",
  "google_ads_conversion_label",
  "google_ads_enabled",
  "meta_pixel_id",
  "meta_pixel_enabled",
];

// Store ads conversion info globally so other components can fire conversion events
export const fireGoogleAdsConversion = () => {
  const w = window as any;
  if (w.__gads_conversion_id && w.__gads_conversion_label && typeof w.gtag === "function") {
    w.gtag("event", "conversion", {
      send_to: `${w.__gads_conversion_id}/${w.__gads_conversion_label}`,
    });
    return true;
  }
  return false;
};

const TrackingScripts = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded) return;

    const load = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", TRACKING_KEYS);

      if (!data) return;

      const cfg: Record<string, string> = {};
      data.forEach((r) => { cfg[r.key] = r.value || ""; });

      // Google Tag Manager
      if (cfg.google_tag_manager_enabled === "true" && cfg.google_tag_manager_id) {
        const gtmId = cfg.google_tag_manager_id;
        const s = document.createElement("script");
        s.textContent = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`;
        document.head.appendChild(s);

        const noscript = document.createElement("noscript");
        const iframe = document.createElement("iframe");
        iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
        iframe.height = "0";
        iframe.width = "0";
        iframe.style.display = "none";
        iframe.style.visibility = "hidden";
        noscript.appendChild(iframe);
        document.body.insertBefore(noscript, document.body.firstChild);
      }

      // Google Analytics 4
      if (cfg.google_analytics_enabled === "true" && cfg.google_analytics_id) {
        const gaId = cfg.google_analytics_id;
        const s = document.createElement("script");
        s.async = true;
        s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(s);

        const s2 = document.createElement("script");
        s2.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`;
        document.head.appendChild(s2);
      }

      // Google Ads
      if (cfg.google_ads_enabled === "true" && cfg.google_ads_id) {
        const adsId = cfg.google_ads_id;
        // gtag.js may already be loaded from GA4
        if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`)) {
          const s = document.createElement("script");
          s.async = true;
          s.src = `https://www.googletagmanager.com/gtag/js?id=${adsId}`;
          document.head.appendChild(s);

          const s2 = document.createElement("script");
          s2.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());`;
          document.head.appendChild(s2);
        }
        const s3 = document.createElement("script");
        s3.textContent = `gtag('config','${adsId}');`;
        document.head.appendChild(s3);
      }

      // Meta Pixel
      if (cfg.meta_pixel_enabled === "true" && cfg.meta_pixel_id) {
        const pixelId = cfg.meta_pixel_id;
        const s = document.createElement("script");
        s.textContent = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`;
        document.head.appendChild(s);

        const noscript = document.createElement("noscript");
        const img = document.createElement("img");
        img.height = 1;
        img.width = 1;
        img.style.display = "none";
        img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
        noscript.appendChild(img);
        document.body.appendChild(noscript);
      }

      setLoaded(true);
    };

    load();
  }, [loaded]);

  return null;
};

export default TrackingScripts;
