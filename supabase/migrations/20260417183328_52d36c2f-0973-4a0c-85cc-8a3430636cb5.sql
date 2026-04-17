-- Add scheduled publish field to blog_posts
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled_at
  ON public.blog_posts(scheduled_at)
  WHERE scheduled_at IS NOT NULL AND status = 'scheduled';

-- Blog templates table
CREATE TABLE IF NOT EXISTS public.blog_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  content text NOT NULL DEFAULT '',
  excerpt text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view templates"
  ON public.blog_templates FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert templates"
  ON public.blog_templates FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update templates"
  ON public.blog_templates FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete templates"
  ON public.blog_templates FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS update_blog_templates_updated_at ON public.blog_templates;
CREATE TRIGGER update_blog_templates_updated_at
  BEFORE UPDATE ON public.blog_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed three default templates (idempotent: only insert if name not present)
INSERT INTO public.blog_templates (name, description, content, excerpt)
SELECT * FROM (VALUES
  (
    'Caso de estudio',
    'Plantilla para presentar un proyecto realizado',
    '<h2>El cliente</h2><p>Breve presentación del cliente y su sector.</p><h2>El reto</h2><p>¿Qué necesidad o problema tenía?</p><h2>Nuestra solución</h2><p>Servicios aplicados, equipo y enfoque.</p><h2>Resultados</h2><ul><li>Resultado 1</li><li>Resultado 2</li></ul><h2>Testimonio</h2><blockquote>"Frase del cliente."</blockquote>',
    'Caso real de cliente: reto, solución y resultados.'
  ),
  (
    'Tutorial / Guía',
    'Estructura paso a paso para artículos didácticos',
    '<h2>Introducción</h2><p>¿Por qué importa este tema?</p><h2>Lo que vas a aprender</h2><ul><li>Punto 1</li><li>Punto 2</li><li>Punto 3</li></ul><h2>Paso 1: ...</h2><p>Explicación.</p><h2>Paso 2: ...</h2><p>Explicación.</p><h2>Paso 3: ...</h2><p>Explicación.</p><h2>Conclusión</h2><p>Resumen y próximos pasos.</p>',
    'Guía paso a paso para...'
  ),
  (
    'Anuncio / Novedad',
    'Lanzamiento de servicio, equipo o evento',
    '<p><strong>Resumen:</strong> Una frase con la noticia.</p><h2>Qué es</h2><p>Descripción de la novedad.</p><h2>Por qué te interesa</h2><p>Beneficios concretos para el lector / cliente.</p><h2>Cómo empezar</h2><p>Llamada a la acción y enlace de contacto.</p>',
    'Anunciamos...'
  )
) AS t(name, description, content, excerpt)
WHERE NOT EXISTS (SELECT 1 FROM public.blog_templates WHERE blog_templates.name = t.name);