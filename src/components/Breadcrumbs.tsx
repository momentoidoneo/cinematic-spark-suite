import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
  className?: string;
}

/**
 * Visible breadcrumb component (the JSON-LD schema is emitted separately via SEOHead).
 * Hidden semantically with aria-label, styled minimal cinematic.
 */
export default function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav aria-label="breadcrumb" className={`flex items-center gap-1 text-xs text-muted-foreground ${className}`}>
      <Link to="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
        <Home className="h-3 w-3" aria-hidden="true" />
        <span className="sr-only">Inicio</span>
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3 opacity-60" aria-hidden="true" />
          {item.href && i < items.length - 1 ? (
            <Link to={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium" aria-current="page">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/** Build crumbs auto from a path like /portafolio/inmobiliaria/lujo */
export function autoCrumbsFromPath(pathname: string, labels?: Record<string, string>): Crumb[] {
  const parts = pathname.split("/").filter(Boolean);
  return parts.map((p, i) => {
    const href = "/" + parts.slice(0, i + 1).join("/");
    const label = labels?.[p] || p.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    return { label, href };
  });
}

export function useAutoCrumbs(labels?: Record<string, string>) {
  const { pathname } = useLocation();
  return autoCrumbsFromPath(pathname, labels);
}
