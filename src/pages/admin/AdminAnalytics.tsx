import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart3, Eye, TrendingUp, Globe, Smartphone, Monitor,
  FileText, Image, FolderOpen, Layers, Tag, MousePointerClick,
  ArrowUpRight, Users, Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
} from "recharts";

interface PageView {
  id: string;
  page_path: string;
  referrer: string | null;
  user_agent: string | null;
  created_at: string;
}

const CHART_COLORS = [
  "hsl(168, 55%, 45%)",
  "hsl(42, 80%, 55%)",
  "hsl(195, 60%, 50%)",
  "hsl(280, 50%, 55%)",
  "hsl(0, 70%, 55%)",
  "hsl(120, 40%, 50%)",
];

const AdminAnalytics = () => {
  const [views, setViews] = useState<PageView[]>([]);
  const [contentStats, setContentStats] = useState({
    categories: 0, subcategories: 0, images: 0, blogPosts: 0, promotions: 0, contacts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"today" | "7d" | "30d" | "all">("30d");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);

      // Fetch page views (last 1000 max)
      const { data: viewsData } = await supabase
        .from("page_views")
        .select("id, page_path, referrer, user_agent, created_at")
        .order("created_at", { ascending: false })
        .limit(1000);

      // Content counts
      const [cats, subs, imgs, posts, promos, contacts] = await Promise.all([
        supabase.from("portfolio_categories").select("id", { count: "exact", head: true }),
        supabase.from("portfolio_subcategories").select("id", { count: "exact", head: true }),
        supabase.from("portfolio_images").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
        supabase.from("promotions").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }),
      ]);

      setViews(viewsData || []);
      setContentStats({
        categories: cats.count ?? 0,
        subcategories: subs.count ?? 0,
        images: imgs.count ?? 0,
        blogPosts: posts.count ?? 0,
        promotions: promos.count ?? 0,
        contacts: contacts.count ?? 0,
      });
      setLoading(false);
    };
    fetch();
  }, []);

  // Filter views by period
  const filteredViews = useMemo(() => {
    if (period === "all") return views;
    const days = period === "7d" ? 7 : 30;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return views.filter(v => new Date(v.created_at) >= cutoff);
  }, [views, period]);

  // Daily views chart
  const dailyChart = useMemo(() => {
    const map = new Map<string, number>();
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 60;
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      map.set(d.toISOString().split("T")[0], 0);
    }
    filteredViews.forEach(v => {
      const day = v.created_at.split("T")[0];
      if (map.has(day)) map.set(day, (map.get(day) || 0) + 1);
    });
    return [...map.entries()].map(([date, count]) => ({
      date: new Date(date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
      visitas: count,
    }));
  }, [filteredViews, period]);

  // Top pages
  const topPages = useMemo(() => {
    const map = new Map<string, number>();
    filteredViews.forEach(v => map.set(v.page_path, (map.get(v.page_path) || 0) + 1));
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, count]) => ({ path, count, pct: filteredViews.length ? Math.round((count / filteredViews.length) * 100) : 0 }));
  }, [filteredViews]);

  // Referrers
  const topReferrers = useMemo(() => {
    const map = new Map<string, number>();
    filteredViews.forEach(v => {
      let source = "Directo";
      if (v.referrer) {
        try {
          const url = new URL(v.referrer);
          source = url.hostname.replace("www.", "");
        } catch { source = v.referrer.slice(0, 30); }
      }
      map.set(source, (map.get(source) || 0) + 1);
    });
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([source, count]) => ({ source, count }));
  }, [filteredViews]);

  // Device breakdown
  const devices = useMemo(() => {
    let mobile = 0, desktop = 0, tablet = 0;
    filteredViews.forEach(v => {
      const ua = (v.user_agent || "").toLowerCase();
      if (/tablet|ipad/i.test(ua)) tablet++;
      else if (/mobile|android|iphone/i.test(ua)) mobile++;
      else desktop++;
    });
    return [
      { name: "Desktop", value: desktop, icon: Monitor },
      { name: "Móvil", value: mobile, icon: Smartphone },
      { name: "Tablet", value: tablet, icon: Globe },
    ].filter(d => d.value > 0);
  }, [filteredViews]);

  // Browser breakdown
  const browsers = useMemo(() => {
    const map = new Map<string, number>();
    filteredViews.forEach(v => {
      const ua = (v.user_agent || "").toLowerCase();
      let browser = "Otro";
      if (ua.includes("chrome") && !ua.includes("edg")) browser = "Chrome";
      else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";
      else if (ua.includes("firefox")) browser = "Firefox";
      else if (ua.includes("edg")) browser = "Edge";
      else if (ua.includes("opera") || ua.includes("opr")) browser = "Opera";
      map.set(browser, (map.get(browser) || 0) + 1);
    });
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  }, [filteredViews]);

  // Hourly distribution
  const hourlyChart = useMemo(() => {
    const hours = Array(24).fill(0);
    filteredViews.forEach(v => {
      const h = new Date(v.created_at).getHours();
      hours[h]++;
    });
    return hours.map((count, h) => ({ hour: `${h}:00`, visitas: count }));
  }, [filteredViews]);

  // Today/week/month counts
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const todayViews = views.filter(v => v.created_at >= todayStart).length;
  const weekViews = views.filter(v => v.created_at >= weekStart).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">Estadísticas y métricas de tu sitio web</p>
        </div>
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          {(["7d", "30d", "all"] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p === "7d" ? "7 días" : p === "30d" ? "30 días" : "Todo"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard label="Hoy" value={todayViews} icon={Eye} color="text-green-400" />
        <KPICard label="Semana" value={weekViews} icon={TrendingUp} color="text-blue-400" />
        <KPICard label="Periodo" value={filteredViews.length} icon={BarChart3} color="text-primary" />
        <KPICard label="Páginas únicas" value={new Set(filteredViews.map(v => v.page_path)).size} icon={MousePointerClick} color="text-accent" />
      </div>

      {/* Main chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Visitas por día</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredViews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No hay datos de visitas para este periodo.</p>
              <p className="text-xs mt-1">Las visitas se registran automáticamente en las páginas públicas.</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyChart}>
                  <defs>
                    <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(168, 55%, 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(168, 55%, 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: "8px", fontSize: 13 }}
                    labelStyle={{ color: "hsl(210, 20%, 92%)" }}
                    itemStyle={{ color: "hsl(168, 55%, 45%)" }}
                  />
                  <Area type="monotone" dataKey="visitas" stroke="hsl(168, 55%, 45%)" strokeWidth={2} fill="url(#colorVisitas)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-primary" /> Páginas más visitadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topPages.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Sin datos</p>
            ) : (
              <div className="space-y-3">
                {topPages.map((p, i) => (
                  <div key={p.path} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{p.path === "/" ? "Inicio" : p.path}</p>
                      <div className="w-full bg-secondary rounded-full h-1.5 mt-1">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${p.pct}%` }} />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-foreground">{p.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Referrers */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" /> Fuentes de tráfico
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topReferrers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Sin datos</p>
            ) : (
              <div className="space-y-3">
                {topReferrers.map(r => (
                  <div key={r.source} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-foreground truncate">{r.source}</span>
                    <span className="text-sm font-bold text-foreground">{r.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Devices */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-primary" /> Dispositivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {devices.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Sin datos</p>
            ) : (
              <div className="flex items-center gap-6">
                <div className="w-36 h-36 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={devices} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={40}>
                        {devices.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: "8px", fontSize: 13 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 flex-1">
                  {devices.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-sm text-foreground">{d.name}</span>
                      <span className="text-sm font-bold text-foreground ml-auto">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Browsers */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" /> Navegadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            {browsers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Sin datos</p>
            ) : (
              <div className="space-y-3">
                {browsers.map((b, i) => {
                  const total = browsers.reduce((s, x) => s + x.value, 0);
                  const pct = total ? Math.round((b.value / total) * 100) : 0;
                  return (
                    <div key={b.name} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-sm text-foreground flex-1">{b.name}</span>
                      <span className="text-xs text-muted-foreground">{pct}%</span>
                      <span className="text-sm font-bold text-foreground">{b.value}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hourly distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Distribución por hora del día
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredViews.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Sin datos</p>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} tickLine={false} axisLine={false} interval={2} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: "8px", fontSize: 13 }}
                    labelStyle={{ color: "hsl(210, 20%, 92%)" }}
                    itemStyle={{ color: "hsl(42, 80%, 55%)" }}
                  />
                  <Bar dataKey="visitas" fill="hsl(42, 80%, 55%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Resumen de Contenido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <ContentStat icon={FolderOpen} label="Categorías" value={contentStats.categories} />
            <ContentStat icon={Layers} label="Subcategorías" value={contentStats.subcategories} />
            <ContentStat icon={Image} label="Imágenes" value={contentStats.images} />
            <ContentStat icon={FileText} label="Blog" value={contentStats.blogPosts} />
            <ContentStat icon={Tag} label="Promos" value={contentStats.promotions} />
            <ContentStat icon={Users} label="Contactos" value={contentStats.contacts} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const KPICard = ({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) => (
  <Card>
    <CardContent className="flex items-center justify-between py-4 px-4">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
      <Icon className={`w-8 h-8 ${color} opacity-50`} />
    </CardContent>
  </Card>
);

const ContentStat = ({ icon: Icon, label, value }: { icon: any; label: string; value: number }) => (
  <div className="text-center py-3">
    <Icon className="w-5 h-5 text-primary mx-auto mb-1.5 opacity-60" />
    <p className="text-xl font-bold text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

export default AdminAnalytics;
