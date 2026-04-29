import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard, FolderOpen, Layers, Image as ImageIcon, BarChart3, HardDrive,
  Megaphone, Tag, FileText, MessageCircle, Settings, FileSignature, Share2,
  Key, Home, Activity, ArrowRightLeft, Mail, DollarSign, Search, Eye, Camera,
  Globe, Sparkles, Plane,
} from "lucide-react";

interface CommandItemDef {
  label: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string;
}

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const go = (path: string) => () => { navigate(path); setOpen(false); };
  const link = (url: string) => () => { window.open(url, "_blank"); setOpen(false); };

  const navigation: CommandItemDef[] = [
    { label: "Dashboard", icon: LayoutDashboard, action: go("/admin"), keywords: "inicio panel" },
    { label: "Analíticas", icon: BarChart3, action: go("/admin/analytics"), keywords: "estadisticas visitas trafico" },
    { label: "Mensajes", icon: Mail, action: go("/admin/messages"), keywords: "contactos leads inbox" },
    { label: "Solicitudes IA", icon: Sparkles, action: go("/admin/quote-requests"), keywords: "cotizador presupuestos leads" },
    { label: "Permisos Dron", icon: Plane, action: go("/admin/drone-permits"), keywords: "uas permisos vuelos enaire aesa" },
    { label: "SEO", icon: Search, action: go("/admin/seo"), keywords: "metadatos posicionamiento" },
  ];
  const portfolio: CommandItemDef[] = [
    { label: "Categorías", icon: FolderOpen, action: go("/admin/categories") },
    { label: "Subcategorías", icon: Layers, action: go("/admin/subcategories") },
    { label: "Imágenes", icon: ImageIcon, action: go("/admin/images") },
    { label: "Almacenamiento", icon: HardDrive, action: go("/admin/storage") },
  ];
  const marketing: CommandItemDef[] = [
    { label: "Suite de Marketing", icon: Megaphone, action: go("/admin/marketing"), keywords: "redes sociales ia campañas" },
    { label: "Promociones", icon: Tag, action: go("/admin/promotions") },
    { label: "Blog", icon: FileText, action: go("/admin/blog"), keywords: "posts artículos" },
    { label: "Landing", icon: Home, action: go("/admin/landing") },
    { label: "Precios", icon: DollarSign, action: go("/admin/pricing") },
  ];
  const comms: CommandItemDef[] = [
    { label: "WhatsApp Chats", icon: MessageCircle, action: go("/admin/whatsapp-chats") },
    { label: "WhatsApp Config", icon: Settings, action: go("/admin/whatsapp-config") },
    { label: "Redes sociales", icon: Share2, action: go("/admin/social") },
  ];
  const settings: CommandItemDef[] = [
    { label: "Tracking (GA, Ads, Pixel)", icon: Activity, action: go("/admin/tracking") },
    { label: "API Keys", icon: Key, action: go("/admin/api-keys") },
    { label: "Textos legales", icon: FileSignature, action: go("/admin/legal") },
    { label: "Migración", icon: ArrowRightLeft, action: go("/admin/migration") },
  ];
  const external: CommandItemDef[] = [
    { label: "Ver landing pública", icon: Eye, action: link("/"), keywords: "web sitio" },
    { label: "Abrir portafolio", icon: Camera, action: link("/portafolio") },
    { label: "Abrir blog público", icon: Globe, action: link("/blog") },
  ];

  const renderGroup = (heading: string, items: CommandItemDef[]) => (
    <CommandGroup heading={heading}>
      {items.map((it) => (
        <CommandItem key={it.label} value={`${it.label} ${it.keywords ?? ""}`} onSelect={it.action}>
          <it.icon className="mr-2 h-4 w-4" />
          <span>{it.label}</span>
        </CommandItem>
      ))}
    </CommandGroup>
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar página, acción o sección..." />
      <CommandList>
        <CommandEmpty>Sin resultados.</CommandEmpty>
        {renderGroup("Navegación", navigation)}
        <CommandSeparator />
        {renderGroup("Portafolio", portfolio)}
        <CommandSeparator />
        {renderGroup("Marketing", marketing)}
        <CommandSeparator />
        {renderGroup("Comunicación", comms)}
        <CommandSeparator />
        {renderGroup("Configuración", settings)}
        <CommandSeparator />
        {renderGroup("Abrir en pestaña nueva", external)}
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;
