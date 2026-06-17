CREATE TABLE public.collaborator_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT DEFAULT '',
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  phone TEXT NOT NULL,
  cameras TEXT[] NOT NULL DEFAULT '{}',
  lenses TEXT[] NOT NULL DEFAULT '{}',
  drones TEXT[] NOT NULL DEFAULT '{}',
  camera_360 TEXT DEFAULT '',
  matterport_compatible BOOLEAN NOT NULL DEFAULT false,
  offers_video BOOLEAN NOT NULL DEFAULT false,
  has_gimbal BOOLEAN NOT NULL DEFAULT false,
  comments TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  is_read BOOLEAN NOT NULL DEFAULT false,
  internal_notes TEXT,
  source TEXT NOT NULL DEFAULT 'trabaja_con_nosotros',
  privacy_accepted BOOLEAN NOT NULL DEFAULT false,
  privacy_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.collaborator_applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collaborator_applications TO authenticated;
GRANT ALL ON public.collaborator_applications TO service_role;

ALTER TABLE public.collaborator_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a collaborator application"
  ON public.collaborator_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (privacy_accepted = true);

CREATE POLICY "Admins can view collaborator applications"
  ON public.collaborator_applications
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update collaborator applications"
  ON public.collaborator_applications
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete collaborator applications"
  ON public.collaborator_applications
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_collaborator_applications_updated_at
  BEFORE UPDATE ON public.collaborator_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_collaborator_applications_status ON public.collaborator_applications(status);
CREATE INDEX idx_collaborator_applications_is_read ON public.collaborator_applications(is_read);
CREATE INDEX idx_collaborator_applications_created_at ON public.collaborator_applications(created_at DESC);
CREATE INDEX idx_collaborator_applications_location ON public.collaborator_applications(country, city);