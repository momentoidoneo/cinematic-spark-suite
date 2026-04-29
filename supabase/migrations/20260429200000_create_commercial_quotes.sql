CREATE TABLE IF NOT EXISTS public.erp_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  company_name TEXT NOT NULL DEFAULT 'Silvio Costa Photography',
  legal_name TEXT,
  vat_number TEXT,
  address TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT NOT NULL DEFAULT 'Portugal',
  country_code TEXT NOT NULL DEFAULT 'PT',
  email TEXT,
  phone TEXT,
  website TEXT,
  bank_name TEXT,
  bank_holder TEXT,
  iban TEXT,
  bic TEXT,
  quote_prefix TEXT NOT NULL DEFAULT 'SC',
  next_quote_number INTEGER NOT NULL DEFAULT 1,
  default_vat_rate NUMERIC NOT NULL DEFAULT 23,
  currency TEXT NOT NULL DEFAULT 'EUR',
  payment_terms TEXT DEFAULT 'Validez del presupuesto: 30 días. Forma de pago según condiciones acordadas.',
  footer_notes TEXT DEFAULT 'Presupuesto emitido sin IVA en la base. El IVA aplicable se calcula según país, NIF/CIF/VAT y validación VIES cuando corresponda.',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.commercial_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft',
  source_quote_request_id UUID REFERENCES public.quote_requests(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_company TEXT,
  client_email TEXT,
  client_phone TEXT,
  client_vat_number TEXT,
  client_country TEXT NOT NULL DEFAULT 'Portugal',
  client_country_code TEXT NOT NULL DEFAULT 'PT',
  client_address TEXT,
  client_postal_code TEXT,
  client_city TEXT,
  is_business BOOLEAN NOT NULL DEFAULT true,
  vies_valid BOOLEAN,
  vies_name TEXT,
  vies_address TEXT,
  vies_checked_at TIMESTAMPTZ,
  vat_rule TEXT NOT NULL DEFAULT 'pt_vat',
  reverse_charge_note TEXT,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  line_items JSONB NOT NULL DEFAULT '[]'::JSONB,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  vat_rate NUMERIC NOT NULL DEFAULT 23,
  vat_amount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  notes TEXT,
  payment_terms TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.erp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercial_quotes ENABLE ROW LEVEL SECURITY;

INSERT INTO public.erp_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

DROP TRIGGER IF EXISTS update_erp_settings_updated_at ON public.erp_settings;
CREATE TRIGGER update_erp_settings_updated_at
BEFORE UPDATE ON public.erp_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_commercial_quotes_updated_at ON public.commercial_quotes;
CREATE TRIGGER update_commercial_quotes_updated_at
BEFORE UPDATE ON public.commercial_quotes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_commercial_quotes_created_at
  ON public.commercial_quotes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_commercial_quotes_status
  ON public.commercial_quotes(status);

CREATE INDEX IF NOT EXISTS idx_commercial_quotes_source_quote_request
  ON public.commercial_quotes(source_quote_request_id);

DROP POLICY IF EXISTS "Admins can view erp settings" ON public.erp_settings;
CREATE POLICY "Admins can view erp settings"
ON public.erp_settings
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert erp settings" ON public.erp_settings;
CREATE POLICY "Admins can insert erp settings"
ON public.erp_settings
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update erp settings" ON public.erp_settings;
CREATE POLICY "Admins can update erp settings"
ON public.erp_settings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view commercial quotes" ON public.commercial_quotes;
CREATE POLICY "Admins can view commercial quotes"
ON public.commercial_quotes
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert commercial quotes" ON public.commercial_quotes;
CREATE POLICY "Admins can insert commercial quotes"
ON public.commercial_quotes
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update commercial quotes" ON public.commercial_quotes;
CREATE POLICY "Admins can update commercial quotes"
ON public.commercial_quotes
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete commercial quotes" ON public.commercial_quotes;
CREATE POLICY "Admins can delete commercial quotes"
ON public.commercial_quotes
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.commercial_quotes REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'commercial_quotes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.commercial_quotes;
  END IF;
END $$;
