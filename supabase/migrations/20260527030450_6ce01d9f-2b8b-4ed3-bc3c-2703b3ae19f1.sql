CREATE TABLE public.client_logos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  link_url TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.client_logos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_logos TO authenticated;
GRANT ALL ON public.client_logos TO service_role;

ALTER TABLE public.client_logos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible logos"
ON public.client_logos FOR SELECT
USING (is_visible = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage logos"
ON public.client_logos FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_client_logos_updated_at
BEFORE UPDATE ON public.client_logos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();