import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

const WhatsAppButton = () => {
  const [phone, setPhone] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("whatsapp_config")
        .select("phone_number, welcome_message")
        .maybeSingle();
      if (data?.phone_number) {
        setPhone(data.phone_number.replace(/[\s\-()]/g, ""));
        setMessage(data.welcome_message || "");
      }
    };
    load();

    // Show tooltip after 3s
    const t = setTimeout(() => setShowTooltip(true), 3000);
    const t2 = setTimeout(() => setShowTooltip(false), 8000);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  if (!phone) return null;

  const url = `https://wa.me/${phone.replace("+", "")}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            className="bg-card border border-border rounded-xl px-4 py-3 shadow-lg max-w-[220px] cursor-pointer"
            onClick={() => window.open(url, "_blank")}
          >
            <p className="text-xs text-muted-foreground mb-0.5">WhatsApp</p>
            <p className="text-sm text-foreground font-medium">¿Necesitas ayuda? ¡Escríbenos!</p>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-7 h-7 text-white" fill="white" />
      </motion.a>
    </div>
  );
};

export default WhatsAppButton;
