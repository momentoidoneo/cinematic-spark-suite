
-- 1. TESTIMONIALS
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL,
  author_role TEXT,
  author_company TEXT,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  avatar_url TEXT,
  video_url TEXT,
  service_tag TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view visible testimonials" ON public.testimonials FOR SELECT USING (is_visible = true OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage testimonials" ON public.testimonials FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. CASE STUDIES
CREATE TABLE public.case_studies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  client TEXT,
  summary TEXT,
  content TEXT NOT NULL DEFAULT '',
  cover_image TEXT,
  before_image TEXT,
  after_image TEXT,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
  services TEXT[] NOT NULL DEFAULT '{}',
  location TEXT,
  testimonial_id UUID,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.case_studies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_studies TO authenticated;
GRANT ALL ON public.case_studies TO service_role;
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published case studies" ON public.case_studies FOR SELECT USING (is_published = true OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage case studies" ON public.case_studies FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_case_studies_updated_at BEFORE UPDATE ON public.case_studies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. QUOTE CALCULATOR OPTIONS
CREATE TABLE public.quote_calculator_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  option_type TEXT NOT NULL DEFAULT 'base',
  base_price NUMERIC NOT NULL DEFAULT 0,
  unit TEXT,
  min_qty INTEGER NOT NULL DEFAULT 1,
  max_qty INTEGER NOT NULL DEFAULT 1,
  multiplier NUMERIC NOT NULL DEFAULT 1,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.quote_calculator_options TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quote_calculator_options TO authenticated;
GRANT ALL ON public.quote_calculator_options TO service_role;
ALTER TABLE public.quote_calculator_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view visible calc options" ON public.quote_calculator_options FOR SELECT USING (is_visible = true OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage calc options" ON public.quote_calculator_options FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_calc_options_updated_at BEFORE UPDATE ON public.quote_calculator_options FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. LEAD MAGNETS
CREATE TABLE public.lead_magnets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  pdf_url TEXT NOT NULL,
  cover_image TEXT,
  pages INTEGER,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lead_magnets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_magnets TO authenticated;
GRANT ALL ON public.lead_magnets TO service_role;
ALTER TABLE public.lead_magnets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active lead magnets" ON public.lead_magnets FOR SELECT USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage lead magnets" ON public.lead_magnets FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_lead_magnets_updated_at BEFORE UPDATE ON public.lead_magnets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. LEAD MAGNET DOWNLOADS
CREATE TABLE public.lead_magnet_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_magnet_id UUID NOT NULL REFERENCES public.lead_magnets(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  source TEXT,
  utm_source TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.lead_magnet_downloads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_magnet_downloads TO authenticated;
GRANT ALL ON public.lead_magnet_downloads TO service_role;
ALTER TABLE public.lead_magnet_downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can register download" ON public.lead_magnet_downloads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view downloads" ON public.lead_magnet_downloads FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete downloads" ON public.lead_magnet_downloads FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
