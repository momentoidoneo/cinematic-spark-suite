import { fireGoogleAdsConversion, trackEvent } from "./TrackingScripts";

interface Props {
  href?: string;
  source: string;
  variant?: "primary" | "outline";
  className?: string;
  children: React.ReactNode;
}

/**
 * CTA reutilizable para "Solicitar Presupuesto" que dispara
 * eventos GA4 + Google Ads conversion en cada clic.
 */
const QuoteCTA = ({ href = "/#contacto", source, variant = "primary", className = "", children }: Props) => {
  const handleClick = () => {
    trackEvent("cta_click", { event_category: "engagement", event_label: source });
    fireGoogleAdsConversion();
  };

  const base =
    variant === "primary"
      ? "px-8 py-3.5 rounded-full bg-gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
      : "px-8 py-3.5 rounded-full border border-border text-foreground font-semibold hover:bg-secondary transition-colors";

  return (
    <a href={href} onClick={handleClick} className={`${base} ${className}`}>
      {children}
    </a>
  );
};

export default QuoteCTA;
