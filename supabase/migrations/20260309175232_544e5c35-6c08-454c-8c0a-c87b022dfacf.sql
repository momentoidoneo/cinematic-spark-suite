ALTER TABLE public.portfolio_categories ADD COLUMN is_visible boolean NOT NULL DEFAULT true;
ALTER TABLE public.portfolio_subcategories ADD COLUMN is_visible boolean NOT NULL DEFAULT true;