
ALTER TABLE public.portfolio_categories 
  ADD COLUMN grid_row integer DEFAULT NULL,
  ADD COLUMN grid_col integer DEFAULT NULL;

ALTER TABLE public.portfolio_subcategories 
  ADD COLUMN grid_row integer DEFAULT NULL,
  ADD COLUMN grid_col integer DEFAULT NULL;

ALTER TABLE public.portfolio_images 
  ADD COLUMN grid_row integer DEFAULT NULL,
  ADD COLUMN grid_col integer DEFAULT NULL;
