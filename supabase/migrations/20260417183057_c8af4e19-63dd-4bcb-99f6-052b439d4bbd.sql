-- Add CRM fields to contact_messages
ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Validation trigger: only allow specific statuses
CREATE OR REPLACE FUNCTION public.validate_contact_message_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('new', 'in_progress', 'closed') THEN
    RAISE EXCEPTION 'Invalid status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_contact_messages_status ON public.contact_messages;
CREATE TRIGGER validate_contact_messages_status
BEFORE INSERT OR UPDATE ON public.contact_messages
FOR EACH ROW EXECUTE FUNCTION public.validate_contact_message_status();

-- Auto-update updated_at
DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON public.contact_messages;
CREATE TRIGGER update_contact_messages_updated_at
BEFORE UPDATE ON public.contact_messages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at DESC);