DROP POLICY IF EXISTS "Anyone can view site settings"
ON public.site_settings;

DROP POLICY IF EXISTS "Public can view non-sensitive site settings"
ON public.site_settings;

CREATE POLICY "Public can view non-sensitive site settings"
ON public.site_settings
FOR SELECT
USING (
  key IN (
    'hero_bg',
    'landing_pricing_plan_ids',
    'google_tag_manager_id',
    'google_tag_manager_enabled',
    'google_analytics_id',
    'google_analytics_enabled',
    'google_ads_id',
    'google_ads_conversion_label',
    'google_ads_whatsapp_conversion_label',
    'google_ads_phone_conversion_label',
    'google_ads_enabled',
    'meta_pixel_id',
    'meta_pixel_enabled'
  )
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

COMMENT ON POLICY "Public can view non-sensitive site settings"
ON public.site_settings
IS 'Exposes only browser-required presentation and tracking identifiers. Administrative and operational values remain admin-only.';
