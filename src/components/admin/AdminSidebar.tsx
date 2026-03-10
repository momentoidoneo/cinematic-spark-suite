import {
  LayoutDashboard, BarChart3, Image, FolderOpen, Layers, HardDrive,
  Megaphone, Tag, FileText, MessageCircle, Settings, Scale, Share2, Key, Monitor, Target, ArrowRightLeft, Mail
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
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
}: {
  label: string;
  items: typeof portfolioItems;
  collapsed: boolean;
}) => (
  <SidebarGroup>
    <SidebarGroupLabel>{label}</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
              <NavLink
                to={item.url}
                end={item.url === "/admin"}
                className="hover:bg-secondary/50"
                activeClassName="bg-primary/10 text-primary font-medium"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {!collapsed && <span>{item.title}</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
);

const AdminSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user } = useAuth();

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <div className="h-14 border-b border-border flex items-center px-4 gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
          SC
        </div>
        {!collapsed && <span className="font-display font-bold text-foreground">Admin Panel</span>}
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-medium text-foreground truncate">
            {user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Admin"}
          </p>
          <p className="text-xs text-muted-foreground">Admin</p>
        </div>
      )}

      <SidebarContent>
        {/* Dashboard */}
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
        <MenuGroup label="WhatsApp" items={whatsappItems} collapsed={collapsed} />
        <SidebarSeparator />
        <MenuGroup label="Configuración" items={settingsItems} collapsed={collapsed} />
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
