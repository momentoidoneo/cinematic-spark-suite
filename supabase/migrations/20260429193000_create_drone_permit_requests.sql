CREATE TABLE IF NOT EXISTS public.drone_permit_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_request_id UUID REFERENCES public.quote_requests(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  service TEXT,
  location TEXT NOT NULL,
  operation_address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  requested_flight_date DATE,
  requested_time_window TEXT,
  drone_model TEXT,
  pilot_name TEXT,
  operator_registration TEXT,
  operation_category TEXT NOT NULL DEFAULT 'pending_review',
  status TEXT NOT NULL DEFAULT 'needs_data',
  priority TEXT NOT NULL DEFAULT 'normal',
  required_actions TEXT[] NOT NULL DEFAULT ARRAY[
    'zone_check',
    'operator_registration',
    'pilot_certificate',
    'insurance',
    'client_authorization',
    'risk_assessment',
    'airspace_coordination',
    'flight_briefing'
  ]::TEXT[],
  completed_actions TEXT[] NOT NULL DEFAULT '{}',
  airspace_notes TEXT,
  risk_notes TEXT,
  internal_notes TEXT,
  documents JSONB NOT NULL DEFAULT '{}'::JSONB,
  source TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.drone_permit_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_drone_permit_requests_created_at
  ON public.drone_permit_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_drone_permit_requests_status
  ON public.drone_permit_requests(status);

CREATE INDEX IF NOT EXISTS idx_drone_permit_requests_quote_request
  ON public.drone_permit_requests(quote_request_id);

DROP TRIGGER IF EXISTS update_drone_permit_requests_updated_at ON public.drone_permit_requests;
CREATE TRIGGER update_drone_permit_requests_updated_at
BEFORE UPDATE ON public.drone_permit_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "Admins can view drone permit requests" ON public.drone_permit_requests;
CREATE POLICY "Admins can view drone permit requests"
ON public.drone_permit_requests
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert drone permit requests" ON public.drone_permit_requests;
CREATE POLICY "Admins can insert drone permit requests"
ON public.drone_permit_requests
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update drone permit requests" ON public.drone_permit_requests;
CREATE POLICY "Admins can update drone permit requests"
ON public.drone_permit_requests
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete drone permit requests" ON public.drone_permit_requests;
CREATE POLICY "Admins can delete drone permit requests"
ON public.drone_permit_requests
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.drone_permit_requests REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'drone_permit_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.drone_permit_requests;
  END IF;
END $$;
