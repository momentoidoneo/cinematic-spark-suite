
ALTER TABLE public.portfolio_images 
ADD COLUMN media_type text NOT NULL DEFAULT 'image',
ADD COLUMN video_url text NULL,
ADD COLUMN thumbnail_url text NULL;

COMMENT ON COLUMN public.portfolio_images.media_type IS 'image, video, or iframe';
COMMENT ON COLUMN public.portfolio_images.video_url IS 'External video or iframe URL';
COMMENT ON COLUMN public.portfolio_images.thumbnail_url IS 'Thumbnail for videos';
