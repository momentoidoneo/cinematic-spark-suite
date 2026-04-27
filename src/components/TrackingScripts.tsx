import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ensureDataLayer, setGoogleAdsConversion } from "@/lib/trackingEvents";

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

const isEnabled = (value?: string) => value === "true";
const isValidGtmId = (value?: string) => /^GTM-[A-Z0-9]+$/i.test(value || "");
const isValidGaId = (value?: string) => /^G-[A-Z0-9]+$/i.test(value || "");
const isValidAdsId = (value?: string) => /^AW-\d+$/i.test(value || "");
const isValidConversionLabel = (value?: string) => /^[A-Za-z0-9_-]{6,80}$/.test(value || "");
const isValidMetaPixelId = (value?: string) => /^\d{8,30}$/.test(value || "");

const trackingElementId = (prefix: string, id: string) => `sc-${prefix}-${id.toLowerCase()}`;

const ensureGtag = (id: string) => {
  const scriptId = trackingElementId("gtag", id);

  if (!document.getElementById(scriptId)) {
    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script);
  }

  ensureDataLayer();
  window.gtag = window.gtag || ((...args: unknown[]) => {
    window.dataLayer?.push(args);
  });
};

const TrackingScripts = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded) return;

    const load = async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("key, value")
          .in("key", TRACKING_KEYS);

        if (!data) return;

        const cfg: Record<string, string> = {};
        data.forEach((r) => {
          cfg[r.key] = r.value || "";
        });

        const gtmId = isEnabled(cfg.google_tag_manager_enabled) && isValidGtmId(cfg.google_tag_manager_id)
          ? cfg.google_tag_manager_id
          : null;
        const gaId = isEnabled(cfg.google_analytics_enabled) && isValidGaId(cfg.google_analytics_id)
          ? cfg.google_analytics_id
          : null;
        const adsId = isEnabled(cfg.google_ads_enabled) && isValidAdsId(cfg.google_ads_id)
          ? cfg.google_ads_id
          : null;
        const adsConversionLabel = isValidConversionLabel(cfg.google_ads_conversion_label)
          ? cfg.google_ads_conversion_label
          : null;
        const pixelId = isEnabled(cfg.meta_pixel_enabled) && isValidMetaPixelId(cfg.meta_pixel_id)
          ? cfg.meta_pixel_id
          : null;

        if (gtmId) {
          ensureDataLayer();
          const scriptId = trackingElementId("gtm", gtmId);

          if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.textContent = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`;
            document.head.appendChild(script);
          }

          const noscriptId = trackingElementId("gtm-noscript", gtmId);

          if (!document.getElementById(noscriptId)) {
            const noscript = document.createElement("noscript");
            noscript.id = noscriptId;
            const iframe = document.createElement("iframe");
            iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
            iframe.height = "0";
            iframe.width = "0";
            iframe.style.display = "none";
            iframe.style.visibility = "hidden";
            noscript.appendChild(iframe);
            document.body.insertBefore(noscript, document.body.firstChild);
          }
        }

        if (!gtmId && gaId) {
          ensureGtag(gaId);
          window.gtag?.("js", new Date());
          window.gtag?.("config", gaId);
        }

        if (!gtmId && adsId) {
          ensureGtag(adsId);
          window.gtag?.("js", new Date());
          window.gtag?.("config", adsId);

          if (adsConversionLabel) {
            setGoogleAdsConversion(adsId, adsConversionLabel);
          }
        } else if (gtmId && adsId && adsConversionLabel) {
          setGoogleAdsConversion(adsId, adsConversionLabel);
        }

        if (pixelId) {
          const scriptId = trackingElementId("meta-pixel", pixelId);

          if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.textContent = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`;
            document.head.appendChild(script);
          }

          const noscriptId = trackingElementId("meta-noscript", pixelId);

          if (!document.getElementById(noscriptId)) {
            const noscript = document.createElement("noscript");
            noscript.id = noscriptId;
            const img = document.createElement("img");
            img.height = 1;
            img.width = 1;
            img.style.display = "none";
            img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
            noscript.appendChild(img);
            document.body.appendChild(noscript);
          }
        }
      } finally {
        setLoaded(true);
      }
    };

    load().catch(() => setLoaded(true));
  }, [loaded]);

  return null;
};

export default TrackingScripts;
