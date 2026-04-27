CREATE TABLE public.conversion_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_label TEXT,
  page_path TEXT,
  session_id TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversion_events_created_at ON public.conversion_events(created_at DESC);
CREATE INDEX idx_conversion_events_event_name ON public.conversion_events(event_name);
CREATE INDEX idx_conversion_events_session ON public.conversion_events(session_id, event_name, created_at DESC);

ALTER TABLE public.conversion_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view conversion events"
  ON public.conversion_events FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can insert conversion events"
  ON public.conversion_events FOR INSERT
  WITH CHECK (true);