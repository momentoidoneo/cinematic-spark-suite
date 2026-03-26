
CREATE TABLE public.seo_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL UNIQUE,
  title text,
  description text,
  og_image text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view seo metadata" ON public.seo_metadata FOR SELECT TO public USING (true);
CREATE POLICY "Admins can insert seo metadata" ON public.seo_metadata FOR INSERT TO public WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update seo metadata" ON public.seo_metadata FOR UPDATE TO public USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete seo metadata" ON public.seo_metadata FOR DELETE TO public USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_seo_metadata_updated_at BEFORE UPDATE ON public.seo_metadata FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
