-- Every new AI quote lead must include an identifiable contact before the
-- estimate is revealed. Existing historical rows remain untouched.
DROP POLICY IF EXISTS "Anyone can create quote requests"
ON public.quote_requests;

CREATE POLICY "Anyone can create quote requests"
ON public.quote_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(btrim(name)) BETWEEN 2 AND 140
  AND email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'
  AND length(email) <= 254
  AND length(service) BETWEEN 2 AND 120
  AND length(scope) BETWEEN 1 AND 500
  AND length(location) BETWEEN 1 AND 180
  AND length(urgency) BETWEEN 1 AND 80
  AND status = 'new'
  AND is_read = false
  AND internal_notes IS NULL
);

COMMENT ON POLICY "Anyone can create quote requests"
ON public.quote_requests
IS 'Public AI quote leads require a name and valid email before the estimate is returned.';