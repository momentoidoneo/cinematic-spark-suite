import { MessageCircle } from "lucide-react";

const AdminWhatsAppChats = () => (
  <div>
    <h1 className="font-display text-3xl font-bold text-foreground mb-2">Chats WhatsApp</h1>
    <p className="text-muted-foreground mb-8">Visualiza y gestiona las conversaciones de WhatsApp</p>
    <div className="rounded-xl bg-card border border-border p-12 flex flex-col items-center justify-center text-center">
      <MessageCircle className="w-12 h-12 text-muted-foreground/40 mb-4" />
      <p className="text-muted-foreground">Próximamente: bandeja de entrada con historial de conversaciones de WhatsApp.</p>
    </div>
  </div>
);

export default AdminWhatsAppChats;
