CREATE TABLE IF NOT EXISTS public.quote_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  service TEXT NOT NULL,
  scope TEXT NOT NULL,
  location TEXT NOT NULL,
  urgency TEXT NOT NULL,
  details TEXT,
  min_amount NUMERIC,
  max_amount NUMERIC,
  currency TEXT NOT NULL DEFAULT 'EUR',
  summary TEXT,
  includes TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  whatsapp_message TEXT,
  request_payload JSONB,
  response_payload JSONB,
  source TEXT NOT NULL DEFAULT 'smart_quoter',
  ai_provider TEXT,
  ai_model TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'closed')),
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create quote requests" ON public.quote_requests;
CREATE POLICY "Anyone can create quote requests"
ON public.quote_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'
  AND length(email) <= 254
  AND length(service) BETWEEN 2 AND 120
  AND length(scope) BETWEEN 1 AND 500
  AND length(location) BETWEEN 1 AND 180
  AND length(urgency) BETWEEN 1 AND 80
  AND status = 'new'
  AND is_read = false
  AND internal_notes IS NULL
);

DROP POLICY IF EXISTS "Admins can view quote requests" ON public.quote_requests;
CREATE POLICY "Admins can view quote requests"
ON public.quote_requests
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update quote requests" ON public.quote_requests;
CREATE POLICY "Admins can update quote requests"
ON public.quote_requests
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete quote requests" ON public.quote_requests;
CREATE POLICY "Admins can delete quote requests"
ON public.quote_requests
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_quote_requests_updated_at ON public.quote_requests;
CREATE TRIGGER update_quote_requests_updated_at
BEFORE UPDATE ON public.quote_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON public.quote_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON public.quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_email ON public.quote_requests(email);
CREATE INDEX IF NOT EXISTS idx_quote_requests_service ON public.quote_requests(service);

ALTER TABLE public.quote_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quote_requests;
