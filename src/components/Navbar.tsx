import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, ChevronDown, LogIn, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type NavChild = { label: string; href: string; isAnchor: boolean };
type NavItem = { label: string; href: string; isAnchor: boolean; children?: NavChild[] };

const staticNavItems: NavItem[] = [
  { label: "Inicio", href: "/#inicio", isAnchor: true },
  {
    label: "Servicios",
    href: "/#servicios",
    isAnchor: true,
    children: [
      { label: "Fotografía", href: "/servicios/fotografia", isAnchor: false },
      { label: "Video y Dron", href: "/servicios/video-dron", isAnchor: false },
      { label: "Tour Virtual 360°", href: "/servicios/tour-virtual", isAnchor: false },
    ],
  },
  {
    label: "Portafolio",
    href: "/portafolio",
    isAnchor: false,
    children: [],
  },
  { label: "Blog", href: "/blog", isAnchor: false },
  { label: "Contacto", href: "/#contacto", isAnchor: true },
];

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
    <Link to={item.href} className={className} onClick={onClick}>
      {item.label}
    </Link>
  );
};

/* ─── Desktop dropdown ─── */
const DesktopDropdown = ({
  item,
  openDropdown,
  setOpenDropdown,
}: {
  item: NavItem;
  openDropdown: string | null;
  setOpenDropdown: (v: string | null) => void;
}) => {
  const hasChildren = item.children && item.children.length > 0;
  const linkClass =
    "relative text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-secondary/60 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[2px] after:bg-primary after:transition-all after:duration-300 hover:after:w-3/4";

  return (
    <div
      className="relative group"
      onMouseEnter={() => hasChildren && setOpenDropdown(item.label)}
      onMouseLeave={() => hasChildren && setOpenDropdown(null)}
    >
      <NavLinkItem item={item} className={linkClass} />
      {hasChildren && (
        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 -mr-1 w-3 h-3 text-muted-foreground transition-transform duration-300 group-hover:rotate-180 pointer-events-none" />
      )}

      {hasChildren && (
        <div className="absolute top-full left-0 pt-2">
          <AnimatePresence>
            {openDropdown === item.label && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="glass rounded-lg p-2 min-w-[180px]"
              >
                {item.children!.map((child) => (
                  <NavLinkItem
                    key={child.label}
                    item={child}
                    className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-md transition-colors"
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

/* ─── Mobile menu item ─── */
const MobileMenuItem = ({
  item,
  onClose,
}: {
  item: NavItem;
  onClose: () => void;
}) => {
  const location = useLocation();
  const hasChildren = item.children && item.children.length > 0;
  const isActive =
    (!item.isAnchor && location.pathname.startsWith(item.href)) ||
    (item.isAnchor && location.pathname === "/" && item.href.includes("#inicio"));

  if (!hasChildren) {
    return (
      <NavLinkItem
        item={item}
        onClick={onClose}
        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-colors ${
          isActive
            ? "bg-primary/10 text-primary"
            : "text-foreground hover:bg-secondary/60"
        }`}
      />
    );
  }

  return (
    <Collapsible>
      <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-base font-medium text-foreground hover:bg-secondary/60 transition-colors group">
        <span>{item.label}</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-4 mt-1 mb-2 pl-4 border-l border-border space-y-1">
          {item.children!.map((child) => {
            const childActive = !child.isAnchor && location.pathname === child.href;
            return (
              <NavLinkItem
                key={child.label}
                item={child}
                onClick={onClose}
                className={`block px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  childActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              />
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

/* ─── Navbar ─── */
const Navbar = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navItems, setNavItems] = useState<NavItem[]>(staticNavItems);

  useEffect(() => {
    supabase
      .from("portfolio_categories")
      .select("name, slug")
      .eq("is_visible", true)
      .order("order")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setNavItems((prev) =>
            prev.map((item) =>
              item.label === "Portafolio"
                ? {
                    ...item,
                    children: data.map((cat) => ({
                      label: cat.name,
                      href: `/portafolio/${cat.slug}`,
                      isAnchor: false,
                    })),
                  }
                : item
            )
          );
        }
      });
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between md:justify-center">
        {/* Mobile hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button className="md:hidden p-2 -ml-2 rounded-lg text-foreground hover:bg-secondary/60 transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </SheetTrigger>

          <SheetContent side="left" className="w-[85vw] max-w-[320px] p-0 glass border-border">
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="px-6 py-5 border-b border-border">
                <span className="text-lg font-display font-bold text-gradient-primary">
                  Silvio Costa
                </span>
              </div>

              {/* Nav items */}
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {navItems.map((item) => (
                  <MobileMenuItem key={item.label} item={item} onClose={closeMobile} />
                ))}
              </nav>

              {/* CTA + Login */}
              <div className="px-4 pb-6 pt-2 space-y-3 border-t border-border">
                <a
                  href="#contacto"
                  onClick={closeMobile}
                  className="block w-full text-center px-5 py-3 text-sm font-semibold rounded-xl bg-gradient-primary text-primary-foreground hover:shadow-glow transition-all duration-300"
                >
                  Solicitar Presupuesto
                </a>
                <Link
                  to="/login"
                  onClick={closeMobile}
                  className="flex items-center justify-center gap-2 w-full px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-xl hover:bg-secondary/60 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Admin
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Mobile brand center */}
        <span className="md:hidden text-sm font-display font-bold text-gradient-primary">
          Silvio Costa
        </span>
        <div className="md:hidden w-10" /> {/* spacer for symmetry */}

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <DesktopDropdown
              key={item.label}
              item={item}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
            />
          ))}
          <a
            href="#contacto"
            className="px-5 py-2 text-sm font-semibold rounded-full bg-gradient-primary text-primary-foreground hover:shadow-glow hover:scale-105 transition-all duration-300"
          >
            Solicitar Presupuesto
          </a>
          <Link
            to="/login"
            className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-secondary/60 hover:scale-110 transition-all duration-300"
            title="Admin Login"
          >
            <LogIn className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
