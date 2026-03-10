
-- Pricing plans (e.g. Básico, Pro, Premium)
CREATE TABLE public.pricing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric,
  price_suffix text DEFAULT '/proyecto',
  features text[] DEFAULT '{}',
  is_highlighted boolean NOT NULL DEFAULT false,
  is_visible boolean NOT NULL DEFAULT true,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Individual pricing services
CREATE TABLE public.pricing_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric,
  price_suffix text DEFAULT '',
  category text,
  is_visible boolean NOT NULL DEFAULT true,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_services ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone can view visible plans/services
CREATE POLICY "Anyone can view visible plans" ON public.pricing_plans FOR SELECT USING (is_visible = true OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert plans" ON public.pricing_plans FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update plans" ON public.pricing_plans FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete plans" ON public.pricing_plans FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view visible services" ON public.pricing_services FOR SELECT USING (is_visible = true OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert services" ON public.pricing_services FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update services" ON public.pricing_services FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete services" ON public.pricing_services FOR DELETE USING (has_role(auth.uid(), 'admin'));
