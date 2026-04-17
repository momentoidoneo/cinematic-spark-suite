CREATE POLICY "Public can update view duration"
ON public.page_views
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);