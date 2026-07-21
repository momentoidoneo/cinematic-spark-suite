import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, LogIn, Menu, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type NavChild = { label: string; href: string; isAnchor: boolean };
type NavItem = {
  label: string;
  href: string;
  isAnchor: boolean;
  children?: NavChild[];
};

const staticNavItems: NavItem[] = [
  { label: "Inicio", href: "/#inicio", isAnchor: true },
  {
    label: "Servicios",
    href: "/#servicios",
    isAnchor: true,
    children: [
      { label: "Fotografía", href: "/servicios/fotografia", isAnchor: false },
      { label: "Vídeo y dron", href: "/servicios/video-dron", isAnchor: false },
      {
        label: "Tour virtual 360°",
        href: "/servicios/tour-virtual",
        isAnchor: false,
      },
      { label: "Eventos", href: "/servicios/eventos", isAnchor: false },
      { label: "Renders 3D", href: "/servicios/renders", isAnchor: false },
    ],
  },
  { label: "Portafolio", href: "/portafolio", isAnchor: false, children: [] },
  { label: "Precios", href: "/precios", isAnchor: false },
  { label: "Blog", href: "/blog", isAnchor: false },
  {
    label: "Trabaja con nosotros",
    href: "/trabaja-con-nosotros",
    isAnchor: false,
  },
  { label: "Contacto", href: "/#contacto", isAnchor: true },
];

const desktopLabels = new Set([
  "Inicio",
  "Servicios",
  "Portafolio",
  "Precios",
  "Blog",
  "Contacto",
]);

const NavLinkItem = ({
  item,
  className,
  onClick,
}: {
  item: NavChild | NavItem;
  className?: string;
  onClick?: () => void;
}) => {
  if (item.isAnchor) {
    return (
      <a href={item.href} className={className} onClick={onClick}>
        {item.label}
      </a>
    );
  }

  return (
    <Link
      to={item.href}
      className={className}
      onClick={() => {
        window.scrollTo(0, 0);
        onClick?.();
      }}
    >
      {item.label}
    </Link>
  );
};

const DesktopDropdown = ({
  item,
  openDropdown,
  setOpenDropdown,
}: {
  item: NavItem;
  openDropdown: string | null;
  setOpenDropdown: (value: string | null) => void;
}) => {
  const hasChildren = Boolean(item.children?.length);
  const linkClass =
    "relative flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60";

  return (
    <div
      className="relative"
      onMouseEnter={() => hasChildren && setOpenDropdown(item.label)}
      onMouseLeave={() => hasChildren && setOpenDropdown(null)}
      onFocus={() => hasChildren && setOpenDropdown(item.label)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setOpenDropdown(null);
      }}
    >
      <div className="relative flex items-center">
        <NavLinkItem item={item} className={linkClass} />
        {hasChildren && (
          <ChevronDown
            className="-ml-2 h-3 w-3 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
        )}
      </div>

      {hasChildren && openDropdown === item.label && (
        <div className="absolute top-full left-0 pt-2">
          <div className="glass rounded-xl p-2 min-w-[210px] shadow-xl">
            {item.children!.map((child) => (
              <NavLinkItem
                key={child.label}
                item={child}
                className="block rounded-lg px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MobileMenuItem = ({
  item,
  onClose,
}: {
  item: NavItem;
  onClose: () => void;
}) => {
  const location = useLocation();
  const hasChildren = Boolean(item.children?.length);
  const isActive =
    (!item.isAnchor && location.pathname.startsWith(item.href)) ||
    (item.isAnchor &&
      location.pathname === "/" &&
      item.href.includes("#inicio"));

  if (!hasChildren) {
    return (
      <NavLinkItem
        item={item}
        onClick={onClose}
        className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium transition-colors ${
          isActive
            ? "bg-primary/10 text-primary"
            : "text-foreground hover:bg-secondary/60"
        }`}
      />
    );
  }

  return (
    <Collapsible>
      <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-secondary/60">
        <span>{item.label}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-4 mt-1 mb-2 space-y-1 border-l border-border pl-4">
          {item.children!.map((child) => {
            const childActive =
              !child.isAnchor && location.pathname === child.href;
            return (
              <NavLinkItem
                key={child.label}
                item={child}
                onClick={onClose}
                className={`block rounded-lg px-4 py-2.5 text-sm transition-colors ${
                  childActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                }`}
              />
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

const Navbar = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navItems, setNavItems] = useState<NavItem[]>(staticNavItems);

  useEffect(() => {
    supabase
      .from("portfolio_categories")
      .select("name,slug")
      .eq("is_visible", true)
      .order("order")
      .then(({ data }) => {
        if (!data?.length) return;
        setNavItems((previous) =>
          previous.map((item) =>
            item.label === "Portafolio"
              ? {
                  ...item,
                  children: data.map((category) => ({
                    label: category.name,
                    href: `/portafolio/${category.slug}`,
                    isAnchor: false,
                  })),
                }
              : item,
          ),
        );
      });
  }, []);

  const closeMobile = () => setMobileOpen(false);
  const openQuoter = () =>
    window.dispatchEvent(new CustomEvent("open-smart-quoter"));
  const desktopItems = navItems.filter((item) => desktopLabels.has(item.label));

  return (
    <nav
      className="fixed inset-x-0 top-0 z-50 glass"
      aria-label="Navegación principal"
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-6 h-16 flex items-center justify-between gap-5">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className="lg:hidden p-2 -ml-2 rounded-lg text-foreground hover:bg-secondary/60 transition-colors"
              aria-label="Abrir menú de navegación"
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
            >
              <Menu className="w-6 h-6" />
            </button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="w-[85vw] max-w-[320px] p-0 glass border-border"
          >
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <div className="flex flex-col h-full">
              <div className="px-6 py-5 border-b border-border">
                <span className="font-display text-lg font-bold text-gradient-primary">
                  Silvio Costa
                </span>
              </div>
              <div
                id="mobile-navigation"
                className="flex-1 overflow-y-auto px-3 py-4 space-y-1"
              >
                {navItems.map((item) => (
                  <MobileMenuItem
                    key={item.label}
                    item={item}
                    onClose={closeMobile}
                  />
                ))}
              </div>
              <div className="px-4 pb-6 pt-3 space-y-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    closeMobile();
                    openQuoter();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/40 px-5 py-3 text-sm font-semibold text-foreground hover:bg-primary/10 transition-colors"
                >
                  <Sparkles className="h-4 w-4 text-primary" /> Cotizador IA
                </button>
                <a
                  href="/#contacto"
                  onClick={closeMobile}
                  className="block w-full rounded-xl bg-gradient-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground"
                >
                  Solicitar presupuesto
                </a>
                <Link
                  to="/login"
                  onClick={closeMobile}
                  className="flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                >
                  <LogIn className="h-4 w-4" /> Admin
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Link
          to="/"
          className="flex flex-col leading-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-md"
        >
          <span className="text-sm font-display font-bold tracking-wide text-foreground uppercase">
            Silvio Costa
          </span>
          <span className="text-[9px] tracking-[0.2em] text-muted-foreground uppercase">
            Servicios audiovisuales
          </span>
        </Link>

        <div className="lg:hidden w-10" aria-hidden="true" />

        <div className="hidden lg:flex items-center gap-1 ml-auto">
          {desktopItems.map((item) => (
            <DesktopDropdown
              key={item.label}
              item={item}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
            />
          ))}
          <button
            type="button"
            onClick={openQuoter}
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-4 py-2 text-sm font-semibold text-foreground hover:bg-primary/10 transition-colors"
          >
            <Sparkles className="h-4 w-4 text-primary" /> Cotizador IA
          </button>
          <a
            href="/#contacto"
            className="ml-1 rounded-full bg-gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Pedir presupuesto
          </a>
          <Link
            to="/login"
            className="p-2 rounded-full text-muted-foreground hover:bg-secondary/60 hover:text-primary transition-colors"
            title="Acceso al panel"
            aria-label="Acceso al panel de administración"
          >
            <LogIn className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
