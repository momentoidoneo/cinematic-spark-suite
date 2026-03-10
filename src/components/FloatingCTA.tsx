import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

/**
 * Floating CTA bar that appears after scrolling past a threshold.
 * Hides when near the footer to avoid overlap.
 */
const FloatingCTA = ({ label = "Solicitar Presupuesto", href = "/#contacto" }: { label?: string; href?: string }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      // Show after 500px, hide near bottom (footer area)
      setVisible(scrollY > 500 && scrollY < docHeight - winHeight - 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden"
        >
          <a
            href={href}
            className="flex items-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-full bg-gradient-primary text-primary-foreground shadow-glow shadow-lg hover:scale-105 transition-transform"
          >
            {label}
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingCTA;
