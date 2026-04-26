DROP POLICY IF EXISTS "Public can update view duration" ON public.page_views;
DROP POLICY IF EXISTS "Insert page views" ON public.page_views;
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;

CREATE POLICY "Authenticated users can insert page views"
ON public.page_views
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);
