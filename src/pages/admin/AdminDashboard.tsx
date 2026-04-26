import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Eye, MailOpen, MessageSquare, TrendingUp, BarChart3, Camera, FileText, Settings,
  FolderOpen, Layers, Image as ImageIcon, Users, Clock, Globe, Zap, Calendar,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from "recharts";
import KPICard from "@/components/admin/dashboard/KPICard";
import {
  fetchRealContactMessages,
  fetchViews,
  groupByDay,
  pctChange,
  periodLabel,
  uniqueSessions,
  type Period,
  type PageViewRow,
} from "@/lib/analytics";

const PERIODS: Period[] = ["today", "7d", "30d"];

const AdminDashboard = () => {
  const [period, setPeriod] = useState<Period>("7d");
  const [views, setViews] = useState<PageViewRow[]>([]);
  const [prevViews, setPrevViews] = useState<PageViewRow[]>([]);
  const [counts, setCounts] = useState({
    categories: 0, subcategories: 0, images: 0,
    messages: 0, messagesInPeriod: 0, unread: 0, totalViews: 0, posts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      const days = period === "today" ? 1 : period === "7d" ? 7 : 30;
      const since = new Date(Date.now() - days * 86400_000).toISOString();
      const prevSince = new Date(Date.now() - days * 2 * 86400_000).toISOString();

      try {
        const [v, pv, cats, subs, messagesAll, messagesInPeriod, viewsAll, posts] = await Promise.all([
          fetchViews(since),
          fetchViews(prevSince),
          supabase.from("portfolio_categories").select("id").eq("is_visible", true),
          supabase.from("portfolio_subcategories").select("id,category_id").eq("is_visible", true),
          fetchRealContactMessages(),
          fetchRealContactMessages(since),
          supabase.from("page_views").select("id", { count: "exact", head: true }),
          supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("status", "published"),
        ]);

        if (cats.error) throw cats.error;
        if (subs.error) throw subs.error;
        if (viewsAll.error) throw viewsAll.error;
        if (posts.error) throw posts.error;

        const visibleCategoryIds = new Set((cats.data || []).map((cat) => cat.id));
        const visibleSubcategoryIds = (subs.data || [])
          .filter((sub) => visibleCategoryIds.has(sub.category_id))
          .map((sub) => sub.id);
        const imgs = visibleSubcategoryIds.length
          ? await supabase
              .from("portfolio_images")
              .select("id", { count: "exact", head: true })
              .in("subcategory_id", visibleSubcategoryIds)
          : { count: 0, error: null };

        if (imgs.error) throw imgs.error;

        setViews(v);
        const cutoff = new Date(since).getTime();
        setPrevViews(pv.filter((r) => new Date(r.created_at).getTime() < cutoff));

        setCounts({
          categories: cats.data?.length ?? 0,
          subcategories: visibleSubcategoryIds.length,
          images: imgs.count ?? 0,
          messages: messagesAll.length,
          messagesInPeriod: messagesInPeriod.length,
          unread: messagesAll.filter((message) => !message.is_read).length,
          totalViews: viewsAll.count ?? 0,
          posts: posts.count ?? 0,
        });
      } catch (error) {
        console.error("[AdminDashboard] Error loading metrics:", error);
        setLoadError("No se pudieron cargar las métricas reales del panel.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [period]);

  const stats = useMemo(() => {
    const days = period === "today" ? 1 : period === "7d" ? 7 : 30;
    const sessions = uniqueSessions(views);
    const prevSessions = uniqueSessions(prevViews);
    const viewsCount = views.length;
    const prevCount = prevViews.length;

    // Bounce: sessions with only 1 view
    const sessionViewCounts: Record<string, number> = {};
    views.forEach((r) => {
      const k = r.session_id || r.user_agent || "anon";
      sessionViewCounts[k] = (sessionViewCounts[k] || 0) + 1;
    });
    const bouncedSessions = Object.values(sessionViewCounts).filter((c) => c === 1).length;
    const bounceRate = sessions > 0 ? (bouncedSessions / sessions) * 100 : 0;

    // Avg session duration
    const durations = views.map((r) => r.duration_seconds || 0).filter((d) => d > 0 && d < 1800);
    const avgDuration = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

    // Pages per session
    const pagesPerSession = sessions > 0 ? viewsCount / sessions : 0;

    return {
      viewsCount,
      prevCount,
      sessions,
      prevSessions,
      bounceRate,
      avgDuration,
      pagesPerSession,
      dailyChart: groupByDay(views, days === 1 ? 1 : days),
      conversionRate: viewsCount > 0 ? (counts.messagesInPeriod / viewsCount) * 100 : 0,
    };
  }, [views, prevViews, period, counts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const formatDuration = (s: number) => {
    if (s < 60) return `${Math.round(s)}s`;
    return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
  };

  const quickActions = [
    { label: "Ver mensajes", icon: MessageSquare, link: "/admin/messages", color: "from-primary/20 to-primary/5", badge: counts.unread },
    { label: "Subir imágenes", icon: Camera, link: "/admin/images", color: "from-accent/20 to-accent/5" },
    { label: "Nuevo post blog", icon: FileText, link: "/admin/blog", color: "from-primary/20 to-primary/5" },
    { label: "SEO", icon: BarChart3, link: "/admin/seo", color: "from-accent/20 to-accent/5" },
    { label: "Marketing", icon: Zap, link: "/admin/marketing", color: "from-primary/20 to-primary/5" },
    { label: "Configuración", icon: Settings, link: "/admin/tracking", color: "from-secondary to-secondary/50" },
  ];
  const hasVisitData = stats.viewsCount > 0;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">Panel de Administración</h1>
          <p className="text-muted-foreground">Resumen con datos reales · {periodLabel[period]}</p>
        </div>
        <div className="inline-flex rounded-lg border border-border bg-card p-1 self-start">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {periodLabel[p]}
            </button>
          ))}
        </div>
      </div>

      {loadError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-6">
          {loadError}
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {quickActions.map((a) => (
          <Link
            key={a.label}
            to={a.link}
            className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-gradient-to-br ${a.color} hover:scale-[1.02] transition-transform`}
          >
            <a.icon className="w-5 h-5 text-foreground" />
            <span className="text-sm font-semibold text-foreground">{a.label}</span>
            {a.badge ? (
              <span className="ml-auto bg-destructive text-destructive-foreground text-xs font-bold px-1.5 py-0.5 rounded-full">
                {a.badge}
              </span>
            ) : null}
          </Link>
        ))}
      </div>

      {/* KPIs row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <KPICard
          label="Visitas"
          value={stats.viewsCount.toLocaleString()}
          icon={Eye}
          change={pctChange(stats.viewsCount, stats.prevCount)}
          link="/admin/analytics"
        />
        <KPICard
          label="Visitantes únicos"
          value={stats.sessions.toLocaleString()}
          icon={Users}
          change={pctChange(stats.sessions, stats.prevSessions)}
          link="/admin/analytics"
        />
        <KPICard
          label="Páginas / sesión"
          value={stats.pagesPerSession.toFixed(1)}
          icon={TrendingUp}
          link="/admin/analytics"
        />
        <KPICard
          label="Duración media"
          value={formatDuration(stats.avgDuration)}
          icon={Clock}
          hint="Tiempo en página"
        />
      </div>

      {/* KPIs row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <KPICard
          label="Mensajes sin leer"
          value={counts.unread}
          icon={MailOpen}
          link="/admin/messages"
          highlight={counts.unread > 0}
        />
        <KPICard
          label="Tasa rebote"
          value={`${stats.bounceRate.toFixed(0)}%`}
          icon={TrendingUp}
          invertChange
          hint="Sesiones con 1 vista"
        />
        <KPICard
          label="Tasa conversión"
          value={`${stats.conversionRate.toFixed(2)}%`}
          icon={BarChart3}
          hint={`${counts.messagesInPeriod} leads reales en ${periodLabel[period]}`}
        />
        <KPICard
          label="Total visitas histórico"
          value={counts.totalViews.toLocaleString()}
          icon={Globe}
          link="/admin/analytics"
        />
      </div>

      {/* Trend chart */}
      <div className="rounded-xl bg-card border border-border p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Evolución de visitas</h2>
            <p className="text-sm text-muted-foreground">Últimos {period === "today" ? "1 día" : period === "7d" ? "7 días" : "30 días"}</p>
          </div>
          <Link to="/admin/analytics" className="text-sm text-primary hover:underline">
            Ver detallado →
          </Link>
        </div>
        {hasVisitData ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyChart}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 rounded-lg border border-dashed border-border bg-muted/20 flex items-center justify-center text-sm text-muted-foreground text-center px-6">
            Sin visitas registradas en este periodo. No se muestran gráficos estimados ni datos de ejemplo.
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-3">
        <h2 className="font-display text-lg font-bold text-foreground">Contenido visible</h2>
        <p className="text-sm text-muted-foreground">Solo cuenta contenido publicado o visible en la web; no incluye borradores ni secciones ocultas.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Categorías visibles", value: counts.categories, icon: FolderOpen, link: "/admin/categories" },
          { label: "Subcategorías visibles", value: counts.subcategories, icon: Layers, link: "/admin/subcategories" },
          { label: "Imágenes visibles", value: counts.images, icon: ImageIcon, link: "/admin/images" },
          { label: "Posts publicados", value: counts.posts, icon: FileText, link: "/admin/blog" },
          { label: "Leads reales", value: counts.messages, icon: MessageSquare, link: "/admin/messages" },
        ].map((c) => (
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
  );
};

export default AdminDashboard;
