
-- 1) ERP settings (singleton row id='default')
CREATE TABLE public.erp_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  company_name TEXT NOT NULL DEFAULT 'Silvio Costa Photography',
  legal_name TEXT,
  vat_number TEXT,
  address TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT DEFAULT 'Portugal',
  country_code TEXT DEFAULT 'PT',
  email TEXT,
  phone TEXT,
  website TEXT,
  bank_name TEXT,
  bank_holder TEXT,
  iban TEXT,
  bic TEXT,
  quote_prefix TEXT DEFAULT 'SC',
  next_quote_number INTEGER NOT NULL DEFAULT 1,
  default_vat_rate NUMERIC NOT NULL DEFAULT 23,
  currency TEXT NOT NULL DEFAULT 'EUR',
  payment_terms TEXT,
  footer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.erp_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access erp_settings"
  ON public.erp_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER erp_settings_set_updated_at
  BEFORE UPDATE ON public.erp_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.erp_settings (id, company_name, legal_name, vat_number, address, postal_code, city, country, country_code, email, phone, website, payment_terms, footer_notes)
VALUES (
  'default',
  'Silvio Costa Photography',
  'Momento Idóneo Lda.',
  'PT517112892',
  'Largo 3 de Fevereiro 128, 5ºE',
  '4100-475',
  'Porto',
  'Portugal',
  'PT',
  'silvio@silviocosta.net',
  '+34 640 934 640',
  'https://silviocosta.net',
  'Validez del presupuesto: 30 días. Forma de pago según condiciones acordadas.',
  'Presupuesto emitido sin IVA en la base. El IVA aplicable se calcula según país, NIF/CIF/VAT y validación VIES cuando corresponda.'
);

-- 2) Commercial clients
CREATE TABLE public.commercial_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  vat_number TEXT,
  country_code TEXT DEFAULT 'PT',
  country TEXT,
  address TEXT,
  postal_code TEXT,
  city TEXT,
  notes TEXT,
  source TEXT DEFAULT 'manual',
  external_source TEXT,
  external_id TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.commercial_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access commercial_clients"
  ON public.commercial_clients FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER commercial_clients_set_updated_at
  BEFORE UPDATE ON public.commercial_clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_commercial_clients_vat ON public.commercial_clients(vat_number);
CREATE INDEX idx_commercial_clients_email ON public.commercial_clients(email);

-- 3) Commercial quotes
CREATE TABLE public.commercial_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  client_id UUID REFERENCES public.commercial_clients(id) ON DELETE SET NULL,
  source_quote_request_id UUID,
  client_name TEXT,
  client_company TEXT,
  client_email TEXT,
  client_phone TEXT,
  client_vat_number TEXT,
  client_country_code TEXT DEFAULT 'PT',
  client_country TEXT,
  client_address TEXT,
  client_postal_code TEXT,
  client_city TEXT,
  is_business BOOLEAN NOT NULL DEFAULT true,
  vies_valid BOOLEAN,
  vies_name TEXT,
  vies_address TEXT,
  vies_checked_at TIMESTAMPTZ,
  vat_rule TEXT,
  reverse_charge_note TEXT,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  vat_rate NUMERIC NOT NULL DEFAULT 0,
  vat_amount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  notes TEXT,
  payment_terms TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.commercial_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access commercial_quotes"
  ON public.commercial_quotes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER commercial_quotes_set_updated_at
  BEFORE UPDATE ON public.commercial_quotes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_commercial_quotes_client ON public.commercial_quotes(client_id);
CREATE INDEX idx_commercial_quotes_status ON public.commercial_quotes(status);
CREATE INDEX idx_commercial_quotes_issue_date ON public.commercial_quotes(issue_date DESC);
