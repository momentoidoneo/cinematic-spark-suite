import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Clock, Search } from "lucide-react";

const AdminWhatsAppChats = () => {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-2">Chats WhatsApp</h1>
      <p className="text-sm text-muted-foreground mb-6">Gestiona las conversaciones de WhatsApp Business</p>

      <div className="rounded-xl bg-card border border-border p-8">
        <div className="flex flex-col items-center text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Integración con WhatsApp Business</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Para activar los chats de WhatsApp necesitas configurar la API de WhatsApp Business. 
            Ve a <strong>Config. WhatsApp</strong> para configurar tu número y API key.
          </p>
          <div className="space-y-3 w-full text-left">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
              <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <div>
                <p className="text-sm font-medium text-foreground">Configura tu número</p>
                <p className="text-xs text-muted-foreground">Añade tu número de WhatsApp Business en la configuración</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
              <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <div>
                <p className="text-sm font-medium text-foreground">Conecta la API</p>
                <p className="text-xs text-muted-foreground">Configura tu API key de WhatsApp Business o un proveedor como Twilio</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
              <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <div>
                <p className="text-sm font-medium text-foreground">Empieza a chatear</p>
                <p className="text-xs text-muted-foreground">Recibe y responde mensajes directamente desde aquí</p>
              </div>
            </div>
          </div>
          <a
            href="/admin/whatsapp-config"
            className="mt-6 px-6 py-2.5 text-sm rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors"
          >
            Ir a Configuración
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminWhatsAppChats;
