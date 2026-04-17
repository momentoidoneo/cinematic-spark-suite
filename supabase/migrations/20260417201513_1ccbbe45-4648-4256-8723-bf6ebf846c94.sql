
-- IndexNow key storage and ping logs
CREATE TABLE public.indexnow_pings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  engine text NOT NULL DEFAULT 'indexnow',
  status text NOT NULL DEFAULT 'pending',
  http_status integer,
  response text,
  triggered_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.indexnow_pings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage indexnow pings"
  ON public.indexnow_pings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_indexnow_pings_created ON public.indexnow_pings (created_at DESC);

-- Insert default IndexNow key into site_settings if not exists
INSERT INTO public.site_settings (key, label, value)
VALUES (
  'indexnow_key',
  'Clave IndexNow (32-128 chars hex)',
  encode(gen_random_bytes(16), 'hex') || encode(gen_random_bytes(16), 'hex')
)
ON CONFLICT DO NOTHING;
