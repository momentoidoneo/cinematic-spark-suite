
CREATE TABLE public.drone_permit_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  service TEXT NOT NULL DEFAULT '',
  client_name TEXT NOT NULL DEFAULT '',
  client_email TEXT NOT NULL DEFAULT '',
  client_phone TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  operation_address TEXT NOT NULL DEFAULT '',
  requested_flight_date DATE,
  requested_time_window TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'needs_data',
  priority TEXT NOT NULL DEFAULT 'normal',
  operation_category TEXT NOT NULL DEFAULT 'pending_review',
  source TEXT NOT NULL DEFAULT 'admin',
  drone_model TEXT NOT NULL DEFAULT '',
  pilot_name TEXT NOT NULL DEFAULT '',
  operator_registration TEXT NOT NULL DEFAULT '',
  latitude NUMERIC,
  longitude NUMERIC,
  airspace_notes TEXT NOT NULL DEFAULT '',
  risk_notes TEXT NOT NULL DEFAULT '',
  internal_notes TEXT NOT NULL DEFAULT '',
  required_actions TEXT[] NOT NULL DEFAULT '{}',
  completed_actions TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.drone_permit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view drone permit requests"
  ON public.drone_permit_requests FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert drone permit requests"
  ON public.drone_permit_requests FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update drone permit requests"
  ON public.drone_permit_requests FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete drone permit requests"
  ON public.drone_permit_requests FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_drone_permit_requests_updated_at
  BEFORE UPDATE ON public.drone_permit_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_drone_permit_requests_status ON public.drone_permit_requests(status);
CREATE INDEX idx_drone_permit_requests_created_at ON public.drone_permit_requests(created_at DESC);
