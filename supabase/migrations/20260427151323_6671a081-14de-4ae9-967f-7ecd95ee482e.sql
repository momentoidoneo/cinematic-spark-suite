-- Create quote_requests table for AI quote cotizador
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
  status TEXT NOT NULL DEFAULT 'new',
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for sorting by date
CREATE INDEX IF NOT EXISTS quote_requests_created_at_idx ON public.quote_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS quote_requests_is_read_idx ON public.quote_requests (is_read);

-- Validate status values via trigger (no CHECK constraints per project conventions)
CREATE OR REPLACE FUNCTION public.validate_quote_request_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('new', 'in_progress', 'closed') THEN
    RAISE EXCEPTION 'Invalid quote request status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_quote_requests_status ON public.quote_requests;
CREATE TRIGGER validate_quote_requests_status
BEFORE INSERT OR UPDATE ON public.quote_requests
FOR EACH ROW
EXECUTE FUNCTION public.validate_quote_request_status();

-- Auto-update updated_at
DROP TRIGGER IF EXISTS update_quote_requests_updated_at ON public.quote_requests;
CREATE TRIGGER update_quote_requests_updated_at
BEFORE UPDATE ON public.quote_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- Anyone (anon) can insert quote requests (used by edge function and as fallback for direct submissions)
CREATE POLICY "Anyone can insert quote requests"
  ON public.quote_requests
  FOR INSERT
  WITH CHECK (true);

-- Only admins can view, update or delete
CREATE POLICY "Admins can view quote requests"
  ON public.quote_requests
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update quote requests"
  ON public.quote_requests
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete quote requests"
  ON public.quote_requests
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));