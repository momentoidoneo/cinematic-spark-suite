import { useEffect, useState } from "react";
import { Cookie, Settings2, ShieldCheck } from "lucide-react";
import { useLocation } from "react-router-dom";
import {
  getStoredCookieConsent,
  OPEN_COOKIE_SETTINGS_EVENT,
  saveCookieConsent,
  type CookieConsentPreferences,
} from "@/lib/cookieConsent";

const emptyPreferences: CookieConsentPreferences = {
  analytics: false,
  marketing: false,
};

const CookieConsentBanner = () => {
  const location = useLocation();
  const [initialConsent] = useState(() => getStoredCookieConsent());
  const [open, setOpen] = useState(!initialConsent);
  const [customizing, setCustomizing] = useState(false);
  const [preferences, setPreferences] = useState<CookieConsentPreferences>(
    initialConsent || emptyPreferences,
  );

  useEffect(() => {
    const handleOpenSettings = () => {
      setPreferences(getStoredCookieConsent() || emptyPreferences);
      setCustomizing(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleOpenSettings);
    return () =>
      window.removeEventListener(
        OPEN_COOKIE_SETTINGS_EVENT,
        handleOpenSettings,
      );
  }, []);

  const save = (next: CookieConsentPreferences) => {
    saveCookieConsent(next);
    setPreferences(next);
    setCustomizing(false);
    setOpen(false);
  };

  if (
    !open ||
    location.pathname === "/login" ||
    location.pathname.startsWith("/admin")
  ) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] px-3 pb-3 sm:px-6 sm:pb-6">
      <div
        role="region"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-description"
        className="mx-auto max-h-[calc(100vh-1.5rem)] max-w-5xl overflow-y-auto rounded-2xl border border-border bg-card/95 p-5 shadow-2xl backdrop-blur-xl sm:p-6"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex max-w-2xl items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Cookie className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="cookie-consent-title"
                className="font-display text-lg font-bold text-foreground"
              >
                Tu privacidad, bajo tu control
              </h2>
              <p
                id="cookie-consent-description"
                className="mt-1 text-sm leading-relaxed text-muted-foreground"
              >
                Utilizamos cookies necesarias para que la web funcione. Con tu
                permiso, Analytics nos ayuda a mejorarla y Google Ads a medir
                solicitudes reales, sin activar publicidad personalizada por
                defecto.
              </p>
              <a
                href="/legal/cookies"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex text-xs font-semibold text-primary hover:underline"
              >
                Consultar la Política de Cookies
              </a>
            </div>
          </div>

          {!customizing && (
            <div className="grid shrink-0 gap-2 sm:grid-cols-3 lg:min-w-[430px]">
              <button
                type="button"
                onClick={() => setCustomizing(true)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                <Settings2 className="h-4 w-4" aria-hidden="true" />
                Configurar
              </button>
              <button
                type="button"
                onClick={() => save(emptyPreferences)}
                className="min-h-11 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Rechazar
              </button>
              <button
                type="button"
                onClick={() => save({ analytics: true, marketing: true })}
                className="min-h-11 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Aceptar todas
              </button>
            </div>
          )}
        </div>

        {customizing && (
          <div className="mt-5 border-t border-border pt-5">
            <div className="grid gap-3 md:grid-cols-3">
              <ConsentOption
                icon={ShieldCheck}
                title="Necesarias"
                description="Seguridad, sesión y preferencias imprescindibles. Siempre activas."
                checked
                disabled
                onChange={() => undefined}
              />
              <ConsentOption
                icon={Cookie}
                title="Analítica"
                description="Nos permite conocer visitas y mejorar el funcionamiento de la web."
                checked={preferences.analytics}
                onChange={(analytics) =>
                  setPreferences((current) => ({ ...current, analytics }))
                }
              />
              <ConsentOption
                icon={Settings2}
                title="Marketing"
                description="Mide solicitudes procedentes de campañas y su efectividad."
                checked={preferences.marketing}
                onChange={(marketing) =>
                  setPreferences((current) => ({ ...current, marketing }))
                }
              />
            </div>
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => save(emptyPreferences)}
                className="min-h-11 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Rechazar todas
              </button>
              <button
                type="button"
                onClick={() => save(preferences)}
                className="min-h-11 rounded-lg border border-primary/40 px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-primary/10"
              >
                Guardar selección
              </button>
              <button
                type="button"
                onClick={() => save({ analytics: true, marketing: true })}
                className="min-h-11 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Aceptar todas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ConsentOption = ({
  icon: Icon,
  title,
  description,
  checked,
  disabled = false,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <label
    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
      checked ? "border-primary/30 bg-primary/5" : "border-border"
    } ${disabled ? "cursor-default" : "hover:border-primary/30"}`}
  >
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-semibold text-foreground">
        {title}
      </span>
      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
        {description}
      </span>
    </span>
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(event) => onChange(event.target.checked)}
      className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
      aria-label={title}
    />
  </label>
);

export default CookieConsentBanner;
