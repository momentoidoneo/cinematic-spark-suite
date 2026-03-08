import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Globe, Mail, Search, Shield, ArrowRight, CheckCircle2, Circle,
  ExternalLink, AlertTriangle, Info, ChevronDown, ChevronUp, Rocket
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MigrationStep {
  id: string;
  phase: string;
  title: string;
  description: string;
  details: string[];
  tips?: string[];
  warnings?: string[];
  links?: { label: string; url: string }[];
  completed: boolean;
}

const initialSteps: MigrationStep[] = [
  // Phase 1: Pre-migration
  {
    id: "backup-wix",
    phase: "pre",
    title: "Hacer backup de contenidos de Wix",
    description: "Descarga y guarda una copia de todos los contenidos que tengas en Wix.",
    details: [
      "Exporta las imágenes del portafolio (ya migradas a Lovable Cloud Storage).",
      "Exporta los posts del blog si los tenías en Wix.",
      "Guarda los textos legales (Política de Privacidad, Aviso Legal, etc.).",
      "Anota las URLs importantes del sitio actual para las redirecciones.",
    ],
    tips: ["Los contenidos del portafolio ya están migrados en tu panel de admin."],
    completed: false,
  },
  {
    id: "verify-content",
    phase: "pre",
    title: "Verificar contenido migrado en Lovable",
    description: "Asegúrate de que todo el contenido está correctamente configurado en el nuevo sitio.",
    details: [
      "Revisa las categorías y subcategorías del portafolio en Admin → Portafolio.",
      "Verifica que las imágenes se muestran correctamente en la galería.",
      "Revisa las páginas de servicios (Fotografía, Video/Dron, Tour Virtual).",
      "Comprueba los textos legales en Admin → Textos Legales.",
      "Revisa el blog en Admin → Blog.",
    ],
    completed: false,
  },
  // Phase 2: Domain
  {
    id: "connect-domain",
    phase: "domain",
    title: "Conectar dominio silviocosta.net a Lovable",
    description: "Configura tu dominio personalizado para que apunte a tu nuevo sitio en Lovable.",
    details: [
      "Ve a la configuración del proyecto en Lovable → Settings → Domains.",
      "Añade 'silviocosta.net' y 'www.silviocosta.net' como dominios.",
      "Lovable te dará los registros DNS que necesitas configurar.",
      "Necesitarás configurar un registro A apuntando a 185.158.133.1",
      "También necesitas un registro TXT para verificar la propiedad del dominio.",
    ],
    tips: [
      "Añade ambos: el dominio raíz (silviocosta.net) y www.silviocosta.net.",
      "Elige uno como primario; el otro redirigirá automáticamente.",
      "Lovable proveerá SSL (HTTPS) automáticamente una vez verificado.",
    ],
    links: [
      { label: "Documentación de dominios", url: "https://docs.lovable.dev/features/custom-domain" },
    ],
    completed: false,
  },
  {
    id: "update-dns",
    phase: "domain",
    title: "Actualizar registros DNS",
    description: "Cambia los registros DNS de tu dominio de Wix a Lovable.",
    details: [
      "Accede al panel de gestión DNS de tu registrador de dominio.",
      "Elimina los registros DNS antiguos que apuntan a Wix.",
      "Añade el registro A: @ → 185.158.133.1 (para silviocosta.net).",
      "Añade el registro A: www → 185.158.133.1 (para www.silviocosta.net).",
      "Añade el registro TXT de verificación que te proporcione Lovable.",
      "La propagación DNS puede tardar hasta 72 horas (normalmente menos de 1h).",
    ],
    warnings: [
      "⚠️ IMPORTANTE: NO elimines los registros MX de Google Workspace para el email.",
      "Solo modifica los registros A y TXT, deja intactos los registros MX.",
    ],
    tips: [
      "Usa dnschecker.org para verificar la propagación de DNS.",
    ],
    links: [
      { label: "DNS Checker", url: "https://dnschecker.org" },
    ],
    completed: false,
  },
  // Phase 3: Email
  {
    id: "preserve-mx",
    phase: "email",
    title: "Preservar registros MX de Google Workspace",
    description: "Tu email silvio@silviocosta.net funciona con Google Workspace. Los registros MX deben mantenerse intactos.",
    details: [
      "Los registros MX son los que dirigen el correo electrónico a los servidores de Google.",
      "Verifica que estos registros MX siguen presentes en tu DNS:",
      "  • MX 1: ASPMX.L.GOOGLE.COM (prioridad 1)",
      "  • MX 5: ALT1.ASPMX.L.GOOGLE.COM (prioridad 5)",
      "  • MX 5: ALT2.ASPMX.L.GOOGLE.COM (prioridad 5)",
      "  • MX 10: ALT3.ASPMX.L.GOOGLE.COM (prioridad 10)",
      "  • MX 10: ALT4.ASPMX.L.GOOGLE.COM (prioridad 10)",
      "Si tu registrador tiene una interfaz visual, asegúrate de que estos registros NO se eliminen al cambiar los registros A.",
    ],
    warnings: [
      "Si eliminas los registros MX, dejarás de recibir correos en silvio@silviocosta.net.",
      "Algunos registradores eliminan TODOS los registros al cambiar la configuración DNS — ten mucho cuidado.",
    ],
    tips: [
      "Antes de tocar nada, haz una captura de pantalla de TODOS tus registros DNS actuales.",
      "Puedes verificar los registros MX con: mxtoolbox.com/SuperTool.aspx",
    ],
    links: [
      { label: "MX Toolbox", url: "https://mxtoolbox.com/SuperTool.aspx" },
      { label: "Google Workspace MX records", url: "https://support.google.com/a/answer/140034" },
    ],
    completed: false,
  },
  {
    id: "verify-spf-dkim",
    phase: "email",
    title: "Verificar registros SPF, DKIM y DMARC",
    description: "Asegúrate de que los registros de autenticación de email están configurados para evitar que tus correos lleguen a spam.",
    details: [
      "Verifica el registro SPF (TXT): debe incluir 'include:_spf.google.com'.",
      "Verifica DKIM: accede a admin.google.com → Apps → Google Workspace → Gmail → Autenticación.",
      "Si tienes DMARC configurado, asegúrate de que sigue funcionando.",
      "Ejemplo de registro SPF: v=spf1 include:_spf.google.com ~all",
    ],
    tips: [
      "Si no tienes DMARC, no es obligatorio pero es recomendable añadirlo.",
      "Ejemplo DMARC básico: v=DMARC1; p=none; rua=mailto:silvio@silviocosta.net",
    ],
    links: [
      { label: "Google DKIM setup", url: "https://support.google.com/a/answer/174124" },
    ],
    completed: false,
  },
  // Phase 4: SEO
  {
    id: "update-search-console",
    phase: "seo",
    title: "Actualizar Google Search Console",
    description: "Notifica a Google del cambio para mantener tu posicionamiento SEO.",
    details: [
      "Accede a Google Search Console (search.google.com/search-console).",
      "Verifica la propiedad del dominio con el nuevo sitio (puede requerir nuevo TXT record).",
      "Envía el nuevo sitemap: silviocosta.net/sitemap.xml",
      "Si las URLs cambiaron de estructura, configura redirecciones 301.",
    ],
    tips: [
      "Tu sitemap.xml ya está generado automáticamente en /sitemap.xml.",
      "El archivo robots.txt ya está configurado en /robots.txt.",
    ],
    links: [
      { label: "Google Search Console", url: "https://search.google.com/search-console" },
    ],
    completed: false,
  },
  {
    id: "update-google-business",
    phase: "seo",
    title: "Actualizar Google Business Profile",
    description: "Actualiza la URL de tu sitio web en tu perfil de Google Business si lo tienes.",
    details: [
      "Accede a business.google.com.",
      "Edita la URL del sitio web si apuntaba a una URL de Wix.",
      "Verifica que la información de contacto sigue siendo correcta.",
    ],
    completed: false,
  },
  {
    id: "update-socials",
    phase: "seo",
    title: "Actualizar enlaces en redes sociales",
    description: "Cambia los enlaces de tu sitio web en todos tus perfiles de redes sociales.",
    details: [
      "Actualiza el enlace en tu perfil de Instagram.",
      "Actualiza el enlace en tu perfil de Facebook / página de empresa.",
      "Actualiza el enlace en LinkedIn.",
      "Actualiza cualquier otro perfil donde tengas el enlace de Wix.",
    ],
    completed: false,
  },
  // Phase 5: Final
  {
    id: "cancel-wix",
    phase: "final",
    title: "Cancelar suscripción de Wix",
    description: "Una vez verificado que todo funciona correctamente, cancela la renovación de Wix.",
    details: [
      "Espera al menos 1-2 semanas después de la migración para asegurarte de que todo funciona.",
      "Verifica que el email sigue funcionando correctamente.",
      "Verifica que el sitio carga bien con el dominio personalizado.",
      "Cancela la renovación automática en Wix (no elimines la cuenta hasta estar 100% seguro).",
    ],
    warnings: [
      "No canceles Wix inmediatamente. Espera a verificar que todo funciona con el nuevo sitio.",
    ],
    completed: false,
  },
  {
    id: "final-test",
    phase: "final",
    title: "Test final completo",
    description: "Realiza una verificación completa de todas las funcionalidades.",
    details: [
      "✓ El dominio silviocosta.net carga correctamente con HTTPS.",
      "✓ www.silviocosta.net redirige al dominio principal.",
      "✓ El email silvio@silviocosta.net envía y recibe correctamente.",
      "✓ El portafolio muestra todas las categorías e imágenes.",
      "✓ Las páginas de servicios funcionan correctamente.",
      "✓ El formulario de contacto / WhatsApp funciona.",
      "✓ El blog muestra los artículos publicados.",
      "✓ El panel de admin es accesible en /admin.",
      "✓ Google Search Console indexa el nuevo sitio.",
    ],
    completed: false,
  },
];

const phaseConfig: Record<string, { label: string; icon: typeof Globe; color: string }> = {
  pre: { label: "Pre-migración", icon: Shield, color: "text-blue-500" },
  domain: { label: "Dominio", icon: Globe, color: "text-emerald-500" },
  email: { label: "Email (Google)", icon: Mail, color: "text-amber-500" },
  seo: { label: "SEO & Perfiles", icon: Search, color: "text-purple-500" },
  final: { label: "Finalización", icon: Rocket, color: "text-rose-500" },
};

const STORAGE_KEY = "migration-checklist-state";

const AdminMigration = () => {
  const [steps, setSteps] = useState<MigrationStep[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const savedIds: Record<string, boolean> = JSON.parse(saved);
        return initialSteps.map((s) => ({ ...s, completed: !!savedIds[s.id] }));
      } catch { return initialSteps; }
    }
    return initialSteps;
  });

  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  useEffect(() => {
    const state: Record<string, boolean> = {};
    steps.forEach((s) => { state[s.id] = s.completed; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [steps]);

  const toggleCompleted = (id: string) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)));
  };

  const phases = ["pre", "domain", "email", "seo", "final"];
  const totalCompleted = steps.filter((s) => s.completed).length;
  const progress = Math.round((totalCompleted / steps.length) * 100);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Asistente de Migración</h1>
        <p className="text-muted-foreground mt-1">Guía paso a paso para migrar de Wix a Lovable</p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Progreso de migración</span>
            <span className="text-sm font-semibold text-primary">{totalCompleted}/{steps.length} pasos completados</span>
          </div>
          <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {progress === 100 && (
            <p className="mt-3 text-sm text-emerald-600 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> ¡Migración completada! 🎉
            </p>
          )}
        </CardContent>
      </Card>

      {/* Phase sections */}
      {phases.map((phase) => {
        const config = phaseConfig[phase];
        const Icon = config.icon;
        const phaseSteps = steps.filter((s) => s.phase === phase);
        const phaseCompleted = phaseSteps.filter((s) => s.completed).length;

        return (
          <div key={phase} className="space-y-3">
            <div className="flex items-center gap-2">
              <Icon className={`w-5 h-5 ${config.color}`} />
              <h2 className="text-lg font-semibold text-foreground">{config.label}</h2>
              <Badge variant={phaseCompleted === phaseSteps.length ? "default" : "secondary"} className="text-xs">
                {phaseCompleted}/{phaseSteps.length}
              </Badge>
            </div>

            {phaseSteps.map((step) => {
              const isExpanded = expandedStep === step.id;
              return (
                <Card
                  key={step.id}
                  className={`transition-colors ${step.completed ? "border-primary/30 bg-primary/5" : ""}`}
                >
                  <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpandedStep(isExpanded ? null : step.id)}>
                    <div className="flex items-start gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleCompleted(step.id); }}
                        className="mt-0.5 shrink-0"
                      >
                        {step.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <CardTitle className={`text-base ${step.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {step.title}
                        </CardTitle>
                        <CardDescription className="mt-0.5">{step.description}</CardDescription>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                      )}
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0 pl-11 space-y-3">
                      <ul className="space-y-1.5">
                        {step.details.map((d, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex gap-2">
                            <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>

                      {step.warnings?.map((w, i) => (
                        <div key={i} className="flex gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                          <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                          <span className="text-sm text-destructive">{w}</span>
                        </div>
                      ))}

                      {step.tips?.map((t, i) => (
                        <div key={i} className="flex gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                          <span className="text-sm text-blue-600 dark:text-blue-400">{t}</span>
                        </div>
                      ))}

                      {step.links && step.links.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {step.links.map((link, i) => (
                            <a
                              key={i}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {link.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default AdminMigration;
