import { useState, useEffect } from "react";
import {
  LayoutDashboard, BarChart3, Image, FolderOpen, Layers, HardDrive,
  Megaphone, Tag, FileText, MessageCircle, Settings, Scale, Share2, Key, Monitor, Target, ArrowRightLeft, Mail, CreditCard, Search, Sparkles
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

const portfolioItems = [
  { title: "Portafolio", url: "/admin/categories", icon: FolderOpen },
  { title: "Subcategorías", url: "/admin/subcategories", icon: Layers },
  { title: "Galería de Imágenes", url: "/admin/images", icon: Image },
  { title: "Almacenamiento", url: "/admin/storage", icon: HardDrive },
];

const marketingItems = [
  { title: "Marketing & RRSS", url: "/admin/marketing", icon: Megaphone },
  { title: "Herramientas Marketing", url: "/admin/marketing-tools", icon: Sparkles },
  { title: "Promociones", url: "/admin/promotions", icon: Tag },
  { title: "Blog", url: "/admin/blog", icon: FileText },
];

const communicationItems = [
  { title: "Mensajes Contacto", url: "/admin/messages", icon: Mail },
  { title: "Chats WhatsApp", url: "/admin/whatsapp-chats", icon: MessageCircle },
  { title: "Config. WhatsApp", url: "/admin/whatsapp-config", icon: Settings },
];

const settingsItems = [
  { title: "Landing Page", url: "/admin/landing", icon: Monitor },
  { title: "SEO & Meta Tags", url: "/admin/seo", icon: Search },
  { title: "Precios", url: "/admin/pricing", icon: CreditCard },
  { title: "Tracking & Ads", url: "/admin/tracking", icon: Target },
  { title: "Textos Legales", url: "/admin/legal", icon: Scale },
  { title: "Redes Sociales", url: "/admin/social", icon: Share2 },
  { title: "API Keys", url: "/admin/api-keys", icon: Key },
  { title: "Migración Wix", url: "/admin/migration", icon: ArrowRightLeft },
];

const MenuGroup = ({
  label,
  items,
  collapsed,
  badges,
}: {
  label: string;
  items: typeof portfolioItems;
  collapsed: boolean;
  badges?: Record<string, number>;
}) => (
  <SidebarGroup>
    <SidebarGroupLabel>{label}</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        {items.map((item) => {
          const badge = badges?.[item.url] || 0;
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  end={item.url === "/admin"}
                  className="hover:bg-secondary/50 relative"
                  activeClassName="bg-primary/10 text-primary font-medium"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                  {badge > 0 && (
                    <span className="ml-auto min-w-5 h-5 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                  {badge > 0 && collapsed && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-destructive" />
                  )}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
);

const AdminSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      const { count } = await supabase
        .from("contact_messages")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);
      setUnreadCount(count || 0);
    };
    fetchUnread();

    const channel = supabase
      .channel("unread-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "contact_messages" },
        (payload) => {
          fetchUnread();
          const msg = payload.new as { name?: string; email?: string };
          toast({
            title: "📩 Nuevo mensaje de contacto",
            description: `${msg.name ?? "Anónimo"} · ${msg.email ?? ""}`,
          });
          // Sonido suave de notificación
          try {
            const audio = new Audio(
              "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="
            );
            audio.volume = 0.3;
            audio.play().catch(() => {});
          } catch {}
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "contact_messages" },
        () => fetchUnread()
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "contact_messages" },
        () => fetchUnread()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const commBadges: Record<string, number> = {
    "/admin/messages": unreadCount,
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <div className="h-14 border-b border-border flex items-center px-4 gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
          SC
        </div>
        {!collapsed && <span className="font-display font-bold text-foreground">Admin Panel</span>}
      </div>

      {!collapsed && (
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-medium text-foreground truncate">
            {user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Admin"}
          </p>
          <p className="text-xs text-muted-foreground">Admin</p>
        </div>
      )}

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/admin"
                    end
                    className="hover:bg-secondary/50"
                    activeClassName="bg-primary/10 text-primary font-medium"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/admin/analytics"
                    className="hover:bg-secondary/50"
                    activeClassName="bg-primary/10 text-primary font-medium"
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Analytics</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />
        <MenuGroup label="Portafolio" items={portfolioItems} collapsed={collapsed} />
        <SidebarSeparator />
        <MenuGroup label="Marketing" items={marketingItems} collapsed={collapsed} />
        <SidebarSeparator />
        <MenuGroup label="Comunicación" items={communicationItems} collapsed={collapsed} badges={commBadges} />
        <SidebarSeparator />
        <MenuGroup label="Configuración" items={settingsItems} collapsed={collapsed} />
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
