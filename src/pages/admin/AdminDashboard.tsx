import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  FolderOpen, Layers, Image as ImageIcon, MessageSquare, Eye, TrendingUp,
  Clock, Calendar, MailOpen, Plus, BarChart3, Camera, FileText, Settings,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

interface Stats {
  categories: number;
  subcategories: number;
  images: number;
  messages: number;
  unreadMessages: number;
  viewsToday: number;
  viewsWeek: number;
  viewsTotal: number;
  uniqueVisitorsWeek: number;
  conversionRate: number;
  topPage: { path: string; count: number } | null;
  dailyChart: { day: string; views: number }[];
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const now = Date.now();
      const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();
      const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [cats, subs, imgs, msgsAll, msgsUnread, viewsAll, viewsToday, viewsWeek] = await Promise.all([
        supabase.from("portfolio_categories").select("id", { count: "exact", head: true }),
        supabase.from("portfolio_subcategories").select("id", { count: "exact", head: true }),
        supabase.from("portfolio_images").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("is_read", false),
        supabase.from("page_views").select("id", { count: "exact", head: true }),
        supabase.from("page_views").select("page_path,user_agent", { count: "exact" }).gte("created_at", oneDayAgo),
        supabase.from("page_views").select("page_path,user_agent,created_at").gte("created_at", sevenDaysAgo).limit(1000),
      ]);

      const weekRows = viewsWeek.data || [];
      const todayCount = viewsToday.count ?? 0;
      const weekCount = weekRows.length;
      const totalViews = viewsAll.count ?? 0;
      const totalMsgs = msgsAll.count ?? 0;

      // Conversion: messages / total views * 100
      const conversionRate = totalViews > 0 ? (totalMsgs / totalViews) * 100 : 0;

      // Unique visitors (by user_agent) in week
      const uniqueAgents = new Set(weekRows.map((r) => r.user_agent || "anon"));

      // Daily chart (last 7 days)
      const dailyMap: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now - i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().slice(0, 10);
        dailyMap[key] = 0;
      }
      weekRows.forEach((r) => {
        const key = (r.created_at as string).slice(0, 10);
        if (key in dailyMap) dailyMap[key]++;
      });
      const dailyChart = Object.entries(dailyMap).map(([key, views]) => ({
        day: new Date(key).toLocaleDateString("es-ES", { weekday: "short", day: "numeric" }),
        views,
      }));

      // Top page (week)
      const pageCounts: Record<string, number> = {};
      weekRows.forEach((r) => {
        pageCounts[r.page_path] = (pageCounts[r.page_path] || 0) + 1;
      });
      const sortedPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]);
      const topPage = sortedPages[0] ? { path: sortedPages[0][0], count: sortedPages[0][1] } : null;

      setStats({
        categories: cats.count ?? 0,
        subcategories: subs.count ?? 0,
        images: imgs.count ?? 0,
        messages: totalMsgs,
        unreadMessages: msgsUnread.count ?? 0,
        viewsToday: todayCount,
        viewsWeek: weekCount,
        viewsTotal: totalViews,
        uniqueVisitorsWeek: uniqueAgents.size,
        conversionRate,
        topPage,
        dailyChart,
      });
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const kpis = [
    { label: "Mensajes sin leer", value: stats.unreadMessages, icon: MailOpen, color: "text-primary", link: "/admin/messages", highlight: stats.unreadMessages > 0 },
    { label: "Visitas hoy", value: stats.viewsToday, icon: Eye, color: "text-accent", link: "/admin/analytics" },
    { label: "Visitas 7 días", value: stats.viewsWeek, icon: Calendar, color: "text-primary", link: "/admin/analytics" },
    { label: "Visitantes únicos (7d)", value: stats.uniqueVisitorsWeek, icon: TrendingUp, color: "text-accent", link: "/admin/analytics" },
    { label: "Tasa conversión", value: `${stats.conversionRate.toFixed(2)}%`, icon: BarChart3, color: "text-primary" },
    { label: "Total mensajes", value: stats.messages, icon: MessageSquare, color: "text-accent", link: "/admin/messages" },
  ];

  const content = [
    { label: "Categorías", value: stats.categories, icon: FolderOpen, link: "/admin/categories" },
    { label: "Subcategorías", value: stats.subcategories, icon: Layers, link: "/admin/subcategories" },
    { label: "Imágenes", value: stats.images, icon: ImageIcon, link: "/admin/images" },
    { label: "Total visitas", value: stats.viewsTotal, icon: Eye, link: "/admin/analytics" },
  ];

  const quickActions = [
    { label: "Ver mensajes", icon: MessageSquare, link: "/admin/messages", color: "bg-primary/10 text-primary border-primary/20" },
    { label: "Subir imágenes", icon: Camera, link: "/admin/images", color: "bg-accent/10 text-accent border-accent/20" },
    { label: "Nuevo post blog", icon: FileText, link: "/admin/blog", color: "bg-primary/10 text-primary border-primary/20" },
    { label: "Configuración", icon: Settings, link: "/admin/tracking", color: "bg-secondary text-foreground border-border" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-foreground mb-2">Panel de Administración</h1>
      <p className="text-muted-foreground mb-8">Resumen en tiempo real de tu actividad</p>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {quickActions.map((a) => (
          <Link
            key={a.label}
            to={a.link}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${a.color} hover:scale-[1.02] transition-transform`}
          >
            <a.icon className="w-5 h-5" />
            <span className="text-sm font-semibold">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {kpis.map((k) => {
          const card = (
            <div
              className={`rounded-xl border p-4 transition-all hover:border-primary/30 ${k.highlight ? "bg-primary/10 border-primary/30 animate-pulse" : "bg-card border-border"}`}
            >
              <k.icon className={`w-5 h-5 ${k.color} mb-2 opacity-80`} />
              <p className="text-2xl font-bold text-foreground">{k.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{k.label}</p>
            </div>
          );
          return k.link ? (
            <Link key={k.label} to={k.link}>{card}</Link>
          ) : (
            <div key={k.label}>{card}</div>
          );
        })}
      </div>

      {/* Daily chart */}
      <div className="rounded-xl bg-card border border-border p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Visitas últimos 7 días</h2>
            <p className="text-sm text-muted-foreground">Evolución diaria del tráfico</p>
          </div>
          <Link to="/admin/analytics" className="text-sm text-primary hover:underline">
            Ver más →
          </Link>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.dailyChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                }}
              />
              <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Content + top page */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="font-display text-lg font-bold text-foreground mb-3">Contenido</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {content.map((c) => (
              <Link
                key={c.label}
                to={c.link}
                className="rounded-xl bg-card border border-border p-4 hover:border-primary/30 transition-colors"
              >
                <c.icon className="w-5 h-5 text-muted-foreground mb-2" />
                <p className="text-2xl font-bold text-foreground">{c.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">Página más visitada</h2>
          <div className="rounded-xl bg-card border border-border p-4">
            {stats.topPage ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-accent" />
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Últimos 7 días</span>
                </div>
                <p className="font-mono text-sm text-foreground truncate">{stats.topPage.path}</p>
                <p className="text-3xl font-bold text-gradient-primary mt-2">{stats.topPage.count}</p>
                <p className="text-xs text-muted-foreground">visitas</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Sin datos suficientes</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
