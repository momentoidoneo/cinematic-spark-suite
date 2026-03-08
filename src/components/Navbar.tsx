import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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
    children: [], // populated dynamically
  },
  { label: "Blog", href: "/blog", isAnchor: false },
  { label: "Contacto", href: "/#contacto", isAnchor: true },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [navItems, setNavItems] = useState<NavItem[]>(staticNavItems);

  useEffect(() => {
    supabase
      .from("portfolio_categories")
      .select("name, slug")
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

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#inicio" className="font-display text-xl font-bold tracking-wide text-foreground">
          SILVIO COSTA
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative group"
              onMouseEnter={() => item.children && item.children.length > 0 && setOpenDropdown(item.label)}
              onMouseLeave={() => item.children && setOpenDropdown(null)}
            >
              {item.isAnchor ? (
                <a
                  href={item.href}
                  className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-secondary/60 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[2px] after:bg-primary after:transition-all after:duration-300 hover:after:w-3/4"
                >
                  {item.label}
                  {item.children && item.children.length > 0 && (
                    <ChevronDown className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180" />
                  )}
                </a>
              ) : (
                <Link
                  to={item.href}
                  className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-secondary/60 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[2px] after:bg-primary after:transition-all after:duration-300 hover:after:w-3/4"
                >
                  {item.label}
                  {item.children && item.children.length > 0 && (
                    <ChevronDown className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180" />
                  )}
                </Link>
              )}

              {item.children && item.children.length > 0 && (
                <div className="absolute top-full left-0 pt-2">
                  <AnimatePresence>
                    {openDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="glass rounded-lg p-2 min-w-[180px]"
                      >
                        {item.children.map((child) =>
                          child.isAnchor ? (
                            <a
                              key={child.label}
                              href={child.href}
                              className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-md transition-colors"
                            >
                              {child.label}
                            </a>
                          ) : (
                            <Link
                              key={child.label}
                              to={child.href}
                              className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-md transition-colors"
                            >
                              {child.label}
                            </Link>
                          )
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
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

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-foreground">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden glass overflow-hidden"
          >
            <div className="px-6 py-4 space-y-3">
              {navItems.map((item) => (
                <div key={item.label}>
                  {item.isAnchor ? (
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={() => setOpen(false)}
                      className="block text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  )}
                  {item.children && item.children.length > 0 && (
                    <div className="pl-4 mt-1 space-y-1">
                      {item.children.map((c) =>
                        c.isAnchor ? (
                          <a key={c.label} href={c.href} onClick={() => setOpen(false)} className="block text-xs text-muted-foreground hover:text-foreground">
                            {c.label}
                          </a>
                        ) : (
                          <Link key={c.label} to={c.href} onClick={() => setOpen(false)} className="block text-xs text-muted-foreground hover:text-foreground">
                            {c.label}
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
              <a
                href="#contacto"
                onClick={() => setOpen(false)}
                className="inline-block px-5 py-2 text-sm font-semibold rounded-full bg-gradient-primary text-primary-foreground"
              >
                Solicitar Presupuesto
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
