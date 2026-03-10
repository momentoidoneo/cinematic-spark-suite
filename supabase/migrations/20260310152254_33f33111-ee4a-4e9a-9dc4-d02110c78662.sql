ALTER TABLE public.pricing_plans ADD COLUMN show_from boolean NOT NULL DEFAULT false;
ALTER TABLE public.pricing_services ADD COLUMN show_from boolean NOT NULL DEFAULT false;