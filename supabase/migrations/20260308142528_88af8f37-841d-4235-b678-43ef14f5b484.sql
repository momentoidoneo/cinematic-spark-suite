
-- Platform connections table
CREATE TABLE public.social_platform_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  account_name TEXT,
  account_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  connection_status TEXT NOT NULL DEFAULT 'pending',
  last_verified_at TIMESTAMPTZ,
  meta_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(platform)
);

ALTER TABLE public.social_platform_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view connections" ON public.social_platform_connections FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert connections" ON public.social_platform_connections FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update connections" ON public.social_platform_connections FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete connections" ON public.social_platform_connections FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Publish queue table
CREATE TABLE public.social_publish_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES public.social_content(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  publish_mode TEXT NOT NULL DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  title TEXT,
  caption TEXT,
  hashtags TEXT[] DEFAULT '{}',
  media_url TEXT,
  media_type TEXT,
  platform_post_id TEXT,
  platform_post_url TEXT,
  platform_response JSONB,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  last_error TEXT,
  next_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.social_publish_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view publish queue" ON public.social_publish_queue FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert publish queue" ON public.social_publish_queue FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update publish queue" ON public.social_publish_queue FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete publish queue" ON public.social_publish_queue FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Publish logs table
CREATE TABLE public.social_publish_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  queue_id UUID REFERENCES public.social_publish_queue(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  request_payload JSONB,
  response_payload JSONB,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.social_publish_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view publish logs" ON public.social_publish_logs FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert publish logs" ON public.social_publish_logs FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));

-- Saved prospects table
CREATE TABLE public.saved_prospects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  profile_url TEXT,
  profile_title TEXT,
  profile_description TEXT,
  profile_content TEXT,
  analysis JSONB,
  generated_dms TEXT,
  brand_context TEXT,
  message_style TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_prospects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view saved prospects" ON public.saved_prospects FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert saved prospects" ON public.saved_prospects FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete saved prospects" ON public.saved_prospects FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Add storage bucket for social media assets
INSERT INTO storage.buckets (id, name, public) VALUES ('social-media-assets', 'social-media-assets', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Admins can upload social assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'social-media-assets' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view social assets" ON storage.objects FOR SELECT USING (bucket_id = 'social-media-assets');
CREATE POLICY "Admins can delete social assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'social-media-assets' AND has_role(auth.uid(), 'admin'));
