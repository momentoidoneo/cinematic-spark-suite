
-- Social content calendar
CREATE TABLE public.social_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  caption TEXT,
  platform TEXT NOT NULL DEFAULT 'instagram',
  content_type TEXT NOT NULL DEFAULT 'post',
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  campaign TEXT,
  hashtags TEXT[] DEFAULT '{}',
  image_url TEXT,
  video_url TEXT,
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.social_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view social content" ON public.social_content FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert social content" ON public.social_content FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update social content" ON public.social_content FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete social content" ON public.social_content FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Content bank
CREATE TABLE public.social_content_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text',
  content TEXT,
  image_url TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  times_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.social_content_bank ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view content bank" ON public.social_content_bank FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert content bank" ON public.social_content_bank FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update content bank" ON public.social_content_bank FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete content bank" ON public.social_content_bank FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Social analytics
CREATE TABLE public.social_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  metric_date DATE NOT NULL,
  followers INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  engagement_rate NUMERIC(5,2) DEFAULT 0,
  profile_views INTEGER DEFAULT 0,
  website_clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(platform, metric_date)
);

ALTER TABLE public.social_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view social analytics" ON public.social_analytics FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert social analytics" ON public.social_analytics FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update social analytics" ON public.social_analytics FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete social analytics" ON public.social_analytics FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_social_content_updated_at BEFORE UPDATE ON public.social_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_social_content_bank_updated_at BEFORE UPDATE ON public.social_content_bank FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
