DROP POLICY IF EXISTS "Public fallback can insert page views" ON public.page_views;

CREATE POLICY "Public fallback can insert page views"
ON public.page_views
FOR INSERT
TO anon
WITH CHECK (
  page_path IS NOT NULL
  AND length(page_path) BETWEEN 1 AND 500
  AND (
    session_id IS NULL
    OR session_id ~ '^[A-Za-z0-9_-]{8,80}$'
  )
);

COMMENT ON POLICY "Public fallback can insert page views" ON public.page_views
IS 'Emergency insert-only fallback for client page tracking while Edge Function deployment is unavailable.';

