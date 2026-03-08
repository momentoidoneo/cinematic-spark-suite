
-- Make page_views insert more restrictive - only allow via edge function or authenticated
DROP POLICY "Anyone can insert page views" ON public.page_views;
CREATE POLICY "Insert page views" ON public.page_views FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR current_setting('request.headers', true)::json->>'x-client-info' IS NOT NULL);
