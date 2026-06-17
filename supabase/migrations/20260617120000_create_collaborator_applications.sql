CREATE TABLE IF NOT EXISTS public.collaborator_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  cameras TEXT[] NOT NULL DEFAULT '{}',
  lenses TEXT[] NOT NULL DEFAULT '{}',
  drones TEXT[] NOT NULL DEFAULT '{}',
  camera_360 TEXT NOT NULL DEFAULT '',
  matterport_compatible BOOLEAN NOT NULL DEFAULT false,
  offers_video BOOLEAN NOT NULL DEFAULT false,
  has_gimbal BOOLEAN NOT NULL DEFAULT false,
  comments TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  is_read BOOLEAN NOT NULL DEFAULT false,
  internal_notes TEXT,
  source TEXT NOT NULL DEFAULT 'public_form',
  privacy_accepted BOOLEAN NOT NULL DEFAULT false,
  privacy_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT collaborator_applications_status_check
    CHECK (status IN ('new', 'reviewing', 'approved', 'rejected', 'archived')),
  CONSTRAINT collaborator_applications_email_check
    CHECK (char_length(email) BETWEEN 5 AND 255),
  CONSTRAINT collaborator_applications_full_name_check
    CHECK (char_length(full_name) BETWEEN 2 AND 160),
  CONSTRAINT collaborator_applications_comments_check
    CHECK (comments IS NULL OR char_length(comments) <= 3000)
);

ALTER TABLE public.collaborator_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit collaborator applications"
  ON public.collaborator_applications;
DROP POLICY IF EXISTS "Admins can view collaborator applications"
  ON public.collaborator_applications;
DROP POLICY IF EXISTS "Admins can update collaborator applications"
  ON public.collaborator_applications;
DROP POLICY IF EXISTS "Admins can delete collaborator applications"
  ON public.collaborator_applications;

CREATE POLICY "Anyone can submit collaborator applications"
  ON public.collaborator_applications
  FOR INSERT
  WITH CHECK (
    privacy_accepted = true
    AND status = 'new'
    AND is_read = false
    AND internal_notes IS NULL
    AND char_length(full_name) BETWEEN 2 AND 160
    AND char_length(email) BETWEEN 5 AND 255
  );

CREATE POLICY "Admins can view collaborator applications"
  ON public.collaborator_applications
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update collaborator applications"
  ON public.collaborator_applications
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete collaborator applications"
  ON public.collaborator_applications
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_collaborator_applications_updated_at
  ON public.collaborator_applications;

CREATE TRIGGER update_collaborator_applications_updated_at
  BEFORE UPDATE ON public.collaborator_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_collaborator_applications_status
  ON public.collaborator_applications(status);
CREATE INDEX IF NOT EXISTS idx_collaborator_applications_is_read
  ON public.collaborator_applications(is_read);
CREATE INDEX IF NOT EXISTS idx_collaborator_applications_created_at
  ON public.collaborator_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collaborator_applications_city_country
  ON public.collaborator_applications(city, country);
