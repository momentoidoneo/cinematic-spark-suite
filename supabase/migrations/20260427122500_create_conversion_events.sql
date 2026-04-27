CREATE TABLE IF NOT EXISTS public.conversion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('cta', 'whatsapp', 'form', 'quote')),
  event_label TEXT,
  page_path TEXT,
  session_id TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.conversion_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view conversion events" ON public.conversion_events;
CREATE POLICY "Admins can view conversion events"
ON public.conversion_events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_conversion_events_created_at
ON public.conversion_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversion_events_name_created_at
ON public.conversion_events (event_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversion_events_session_created_at
ON public.conversion_events (session_id, created_at DESC)
WHERE session_id IS NOT NULL;

