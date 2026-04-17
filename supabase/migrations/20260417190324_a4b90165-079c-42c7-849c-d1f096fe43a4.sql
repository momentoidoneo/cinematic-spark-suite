CREATE TABLE public.seo_cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'España',
  intro TEXT NOT NULL DEFAULT '',
  highlights TEXT[] NOT NULL DEFAULT '{}',
  zones TEXT[] NOT NULL DEFAULT '{}',
  postal TEXT,
  geo_lat NUMERIC,
  geo_lng NUMERIC,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible cities"
ON public.seo_cities FOR SELECT
USING (is_visible = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage cities"
ON public.seo_cities FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_seo_cities_updated_at
BEFORE UPDATE ON public.seo_cities
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_seo_cities_slug ON public.seo_cities(slug);
CREATE INDEX idx_seo_cities_visible_order ON public.seo_cities(is_visible, "order");