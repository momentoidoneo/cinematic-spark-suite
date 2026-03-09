ALTER TABLE public.portfolio_subcategories ADD COLUMN slug text;

-- Generate slugs from existing names
UPDATE public.portfolio_subcategories 
SET slug = lower(
  regexp_replace(
    regexp_replace(
      translate(name, 'áéíóúñÁÉÍÓÚÑ', 'aeiounAEIOUN'),
      '[^a-zA-Z0-9\s-]', '', 'g'
    ),
    '\s+', '-', 'g'
  )
);

ALTER TABLE public.portfolio_subcategories ALTER COLUMN slug SET NOT NULL;