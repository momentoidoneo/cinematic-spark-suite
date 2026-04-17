
-- ============ UTM LINKS ============
CREATE TABLE public.utm_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  utm_source TEXT NOT NULL,
  utm_medium TEXT NOT NULL,
  utm_campaign TEXT NOT NULL,
  utm_term TEXT,
  utm_content TEXT,
  short_code TEXT UNIQUE,
  full_url TEXT NOT NULL,
  click_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.utm_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage utm_links" ON public.utm_links FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_utm_links_updated_at BEFORE UPDATE ON public.utm_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_utm_links_campaign ON public.utm_links(utm_campaign);

-- ============ A/B TESTS ============
CREATE TABLE public.ab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL DEFAULT 'hero', -- hero | cta-section | floating | service-page
  status TEXT NOT NULL DEFAULT 'draft', -- draft | running | paused | completed
  target_device TEXT NOT NULL DEFAULT 'all', -- all | desktop | mobile | tablet
  target_source TEXT, -- utm_source filter (null = all)
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  winner_variant_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage ab_tests" ON public.ab_tests FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public can view running ab_tests" ON public.ab_tests FOR SELECT
  USING (status = 'running');
CREATE TRIGGER update_ab_tests_updated_at BEFORE UPDATE ON public.ab_tests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.ab_test_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.ab_tests(id) ON DELETE CASCADE,
  label TEXT NOT NULL, -- A, B, C...
  button_text TEXT NOT NULL,
  button_color TEXT, -- tailwind class or hex
  weight INTEGER NOT NULL DEFAULT 50,
  is_control BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ab_test_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage variants" ON public.ab_test_variants FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public can view variants" ON public.ab_test_variants FOR SELECT USING (true);
CREATE INDEX idx_variants_test ON public.ab_test_variants(test_id);

CREATE TABLE public.ab_test_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.ab_tests(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.ab_test_variants(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- impression | click | conversion
  session_id TEXT,
  device_type TEXT,
  utm_source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ab_test_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert ab events" ON public.ab_test_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view ab events" ON public.ab_test_events FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE INDEX idx_events_test_variant ON public.ab_test_events(test_id, variant_id);
CREATE INDEX idx_events_created ON public.ab_test_events(created_at DESC);

-- ============ NEWSLETTER ============
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  provider TEXT NOT NULL DEFAULT 'resend', -- resend | brevo | mailchimp
  status TEXT NOT NULL DEFAULT 'subscribed', -- subscribed | unsubscribed | pending | bounced
  tags TEXT[] DEFAULT '{}',
  source TEXT, -- form id / page
  utm_source TEXT,
  utm_campaign TEXT,
  external_id TEXT, -- id at provider
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view subscribers" ON public.newsletter_subscribers FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update subscribers" ON public.newsletter_subscribers FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete subscribers" ON public.newsletter_subscribers FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_subscribers_updated_at BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_subscribers_status ON public.newsletter_subscribers(status);

CREATE TABLE public.newsletter_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  preview_text TEXT,
  html_content TEXT NOT NULL DEFAULT '',
  provider TEXT NOT NULL DEFAULT 'resend',
  status TEXT NOT NULL DEFAULT 'draft', -- draft | scheduled | sending | sent | failed
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipients_count INTEGER DEFAULT 0,
  opens_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  bounces_count INTEGER DEFAULT 0,
  external_id TEXT,
  tags_filter TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage campaigns" ON public.newsletter_campaigns FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.newsletter_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ COMPETITORS ============
CREATE TABLE public.competitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  monitoring_mode TEXT NOT NULL DEFAULT 'manual', -- manual | weekly
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_checked_at TIMESTAMPTZ,
  last_change_detected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage competitors" ON public.competitors FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_competitors_updated_at BEFORE UPDATE ON public.competitors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.competitor_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor_id UUID NOT NULL REFERENCES public.competitors(id) ON DELETE CASCADE,
  content_hash TEXT,
  markdown TEXT,
  title TEXT,
  meta_description TEXT,
  links_count INTEGER,
  changes_summary TEXT, -- AI summary of differences
  has_changes BOOLEAN NOT NULL DEFAULT false,
  screenshot_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.competitor_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage snapshots" ON public.competitor_snapshots FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE INDEX idx_snapshots_competitor ON public.competitor_snapshots(competitor_id, created_at DESC);
