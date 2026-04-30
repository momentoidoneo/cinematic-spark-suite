CREATE TABLE IF NOT EXISTS public.commercial_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  vat_number TEXT,
  country TEXT NOT NULL DEFAULT 'Portugal',
  country_code TEXT NOT NULL DEFAULT 'PT',
  address TEXT,
  postal_code TEXT,
  city TEXT,
  notes TEXT,
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  source TEXT NOT NULL DEFAULT 'manual',
  external_source TEXT,
  external_id TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.commercial_clients ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.commercial_quotes
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.commercial_clients(id) ON DELETE SET NULL;

DROP TRIGGER IF EXISTS update_commercial_clients_updated_at ON public.commercial_clients;
CREATE TRIGGER update_commercial_clients_updated_at
BEFORE UPDATE ON public.commercial_clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_commercial_clients_created_at
  ON public.commercial_clients(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_commercial_clients_email
  ON public.commercial_clients(lower(email));

CREATE INDEX IF NOT EXISTS idx_commercial_clients_vat
  ON public.commercial_clients(upper(vat_number));

CREATE UNIQUE INDEX IF NOT EXISTS idx_commercial_clients_external
  ON public.commercial_clients(external_source, external_id)
  WHERE external_source IS NOT NULL AND external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_commercial_quotes_client_id
  ON public.commercial_quotes(client_id);

DROP POLICY IF EXISTS "Admins can view commercial clients" ON public.commercial_clients;
CREATE POLICY "Admins can view commercial clients"
ON public.commercial_clients
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert commercial clients" ON public.commercial_clients;
CREATE POLICY "Admins can insert commercial clients"
ON public.commercial_clients
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update commercial clients" ON public.commercial_clients;
CREATE POLICY "Admins can update commercial clients"
ON public.commercial_clients
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete commercial clients" ON public.commercial_clients;
CREATE POLICY "Admins can delete commercial clients"
ON public.commercial_clients
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.commercial_clients REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'commercial_clients'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.commercial_clients;
  END IF;
END $$;
