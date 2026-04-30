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
  completed_actions TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  airspace_notes TEXT,
  risk_notes TEXT,
  internal_notes TEXT,
  documents JSONB NOT NULL DEFAULT '{}'::JSONB,
  source TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.drone_permit_requests
  ADD COLUMN IF NOT EXISTS quote_request_id UUID REFERENCES public.quote_requests(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS client_email TEXT,
  ADD COLUMN IF NOT EXISTS client_phone TEXT,
  ADD COLUMN IF NOT EXISTS service TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS operation_address TEXT,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS requested_flight_date DATE,
  ADD COLUMN IF NOT EXISTS requested_time_window TEXT,
  ADD COLUMN IF NOT EXISTS drone_model TEXT,
  ADD COLUMN IF NOT EXISTS pilot_name TEXT,
  ADD COLUMN IF NOT EXISTS operator_registration TEXT,
  ADD COLUMN IF NOT EXISTS operation_category TEXT DEFAULT 'pending_review',
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'needs_data',
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS required_actions TEXT[] DEFAULT ARRAY[
    'zone_check',
    'operator_registration',
    'pilot_certificate',
    'insurance',
    'client_authorization',
    'risk_assessment',
    'airspace_coordination',
    'flight_briefing'
  ]::TEXT[],
  ADD COLUMN IF NOT EXISTS completed_actions TEXT[] DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS airspace_notes TEXT,
  ADD COLUMN IF NOT EXISTS risk_notes TEXT,
  ADD COLUMN IF NOT EXISTS internal_notes TEXT,
  ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '{}'::JSONB,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'admin',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

UPDATE public.drone_permit_requests
SET
  title = COALESCE(NULLIF(title, ''), 'Trámite dron sin título'),
  location = COALESCE(NULLIF(location, ''), 'Ubicación pendiente'),
  operation_category = COALESCE(NULLIF(operation_category, ''), 'pending_review'),
  status = COALESCE(NULLIF(status, ''), 'needs_data'),
  priority = COALESCE(NULLIF(priority, ''), 'normal'),
  required_actions = COALESCE(required_actions, ARRAY[
    'zone_check',
    'operator_registration',
    'pilot_certificate',
    'insurance',
    'client_authorization',
    'risk_assessment',
    'airspace_coordination',
    'flight_briefing'
  ]::TEXT[]),
  completed_actions = COALESCE(completed_actions, '{}'::TEXT[]),
  documents = COALESCE(documents, '{}'::JSONB),
  source = COALESCE(NULLIF(source, ''), 'admin'),
  created_at = COALESCE(created_at, now()),
  updated_at = COALESCE(updated_at, now());

ALTER TABLE public.drone_permit_requests
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN location SET NOT NULL,
  ALTER COLUMN operation_category SET DEFAULT 'pending_review',
  ALTER COLUMN operation_category SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'needs_data',
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN priority SET DEFAULT 'normal',
  ALTER COLUMN priority SET NOT NULL,
  ALTER COLUMN required_actions SET DEFAULT ARRAY[
    'zone_check',
    'operator_registration',
    'pilot_certificate',
    'insurance',
    'client_authorization',
    'risk_assessment',
    'airspace_coordination',
    'flight_briefing'
  ]::TEXT[],
  ALTER COLUMN required_actions SET NOT NULL,
  ALTER COLUMN completed_actions SET DEFAULT '{}'::TEXT[],
  ALTER COLUMN completed_actions SET NOT NULL,
  ALTER COLUMN documents SET DEFAULT '{}'::JSONB,
  ALTER COLUMN documents SET NOT NULL,
  ALTER COLUMN source SET DEFAULT 'admin',
  ALTER COLUMN source SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE public.drone_permit_requests ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.drone_permit_requests TO authenticated;

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

NOTIFY pgrst, 'reload schema';
