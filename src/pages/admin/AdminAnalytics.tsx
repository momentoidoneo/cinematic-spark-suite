import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Eye, Users, Globe, Smartphone, Monitor, Tablet, Download, TrendingUp, Clock,
  Link2, Megaphone, FileText,
} from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip, XAxis, YAxis, CartesianGrid,
} from "recharts";
import KPICard from "@/components/admin/dashboard/KPICard";
import HeatmapChart from "@/components/admin/dashboard/HeatmapChart";
import ConversionFunnel from "@/components/admin/dashboard/ConversionFunnel";
import {
  fetchViews, groupByDay, uniqueSessions, topBy, referrerHost, exportCSV,
  pctChange, periodLabel, type Period, type PageViewRow,
} from "@/lib/analytics";

const PERIODS: Period[] = ["today", "7d", "30d", "90d", "all"];
const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(45 90% 60%)", "hsl(280 70% 60%)", "hsl(20 80% 60%)", "hsl(180 60% 50%)"];

const AdminAnalytics = () => {
  const [period, setPeriod] = useState<Period>("7d");
  const [views, setViews] = useState<PageViewRow[]>([]);
  const [prevViews, setPrevViews] = useState<PageViewRow[]>([]);
  const [messagesCount, setMessagesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const days = period === "today" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 1825;
      const since = new Date(Date.now() - days * 86400_000).toISOString();
      const prevSince = new Date(Date.now() - days * 2 * 86400_000).toISOString();
      const cutoff = new Date(since).getTime();

      const [v, pv, msgs] = await Promise.all([
        fetchViews(since),
        period === "all" ? Promise.resolve([] as PageViewRow[]) : fetchViews(prevSince),
        supabase.from("contact_messages").select("id,created_at", { count: "exact" }).gte("created_at", since),
      ]);
      setViews(v);
      setPrevViews(pv.filter((r) => new Date(r.created_at).getTime() < cutoff));
      setMessagesCount(msgs.count ?? 0);
      setLoading(false);
    };
    load();
  }, [period]);

  const stats = useMemo(() => {
    const days = period === "today" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 90;
    const sessions = uniqueSessions(views);
    const prevSessions = uniqueSessions(prevViews);

    const sessionViews: Record<string, number> = {};
    views.forEach((r) => {
      const k = r.session_id || r.user_agent || "anon";
      sessionViews[k] = (sessionViews[k] || 0) + 1;
    });
    const bouncedSessions = Object.values(sessionViews).filter((c) => c === 1).length;
    const bounceRate = sessions > 0 ? (bouncedSessions / sessions) * 100 : 0;

    const durations = views.map((r) => r.duration_seconds || 0).filter((d) => d > 0 && d < 1800);
    const avgDuration = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

    const dailyChart = groupByDay(views, days);

    const pageStats: Record<string, { count: number; totalDur: number; durCount: number }> = {};
    views.forEach((r) => {
      if (!pageStats[r.page_path]) pageStats[r.page_path] = { count: 0, totalDur: 0, durCount: 0 };
      pageStats[r.page_path].count++;
      if (r.duration_seconds && r.duration_seconds < 1800) {
        pageStats[r.page_path].totalDur += r.duration_seconds;
        pageStats[r.page_path].durCount++;
      }
    });
    const topPages = Object.entries(pageStats)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([path, s]) => ({
        path, count: s.count,
        avgDur: s.durCount ? s.totalDur / s.durCount : 0,
      }));

    const refCounts: Record<string, number> = {};
    views.forEach((r) => {
      const h = referrerHost(r.referrer);
      refCounts[h] = (refCounts[h] || 0) + 1;
    });
    const topReferrers = Object.entries(refCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    const devices = topBy(views, "device_type", 5);
    const browsers = topBy(views, "browser", 6);
    const os = topBy(views, "os", 5);
    const countries = topBy(views, "country", 10).filter((c) => c.name !== "(desconocido)");
    const campaigns = topBy(views, "utm_campaign", 8).filter((c) => c.name !== "(desconocido)");
    const sources = topBy(views, "utm_source", 8).filter((c) => c.name !== "(desconocido)");

    return {
      viewsCount: views.length, prevCount: prevViews.length,
      sessions, prevSessions, bounceRate, avgDuration,
      pagesPerSession: sessions > 0 ? views.length / sessions : 0,
      dailyChart, topPages, topReferrers, devices, browsers, os,
      countries, campaigns, sources,
    };
  }, [views, prevViews, period]);

  const formatDuration = (s: number) => s < 60 ? `${Math.round(s)}s` : `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;

  const handleExport = () => {
    exportCSV(
      views.map((r) => ({
        fecha: r.created_at, pagina: r.page_path, sesion: r.session_id ?? "",
        pais: r.country ?? "", ciudad: r.city ?? "",
        dispositivo: r.device_type ?? "", navegador: r.browser ?? "", os: r.os ?? "",
        referrer: r.referrer ?? "",
        utm_source: r.utm_source ?? "", utm_medium: r.utm_medium ?? "", utm_campaign: r.utm_campaign ?? "",
        duracion_s: r.duration_seconds ?? "",
      })),
      `analytics-${period}-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">Analíticas</h1>
          <p className="text-muted-foreground">{periodLabel[period]} · {views.length} visitas registradas</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-lg border border-border bg-card p-1">
            {PERIODS.map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}>
                {periodLabel[p]}
              </button>
            ))}
          </div>
          <button onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-secondary transition-colors">
            <Download className="w-3.5 h-3.5" />CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <KPICard label="Visitas" value={stats.viewsCount.toLocaleString()} icon={Eye}
          change={period !== "all" ? pctChange(stats.viewsCount, stats.prevCount) : undefined} />
        <KPICard label="Visitantes únicos" value={stats.sessions.toLocaleString()} icon={Users}
          change={period !== "all" ? pctChange(stats.sessions, stats.prevSessions) : undefined} />
        <KPICard label="Páginas / sesión" value={stats.pagesPerSession.toFixed(1)} icon={TrendingUp} />
        <KPICard label="Duración media" value={formatDuration(stats.avgDuration)} icon={Clock} />
      </div>

      <div className="rounded-xl bg-card border border-border p-6 mb-8">
        <h2 className="font-display text-lg font-bold text-foreground mb-4">Evolución de visitas</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.dailyChart}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl bg-card border border-border p-6">
          <h2 className="font-display text-lg font-bold text-foreground mb-1">Mapa de calor</h2>
          <p className="text-sm text-muted-foreground mb-4">Visitas por día y hora</p>
          <HeatmapChart rows={views} />
        </div>
        <div className="rounded-xl bg-card border border-border p-6">
          <h2 className="font-display text-lg font-bold text-foreground mb-1">Embudo de conversión</h2>
          <p className="text-sm text-muted-foreground mb-4">Visitas → sesiones únicas → leads</p>
          <ConversionFunnel
            steps={[
              { label: "Visitas totales", value: stats.viewsCount },
              { label: "Sesiones únicas", value: stats.sessions, hint: "Visitantes diferentes" },
              { label: "Sesiones engaged", value: stats.sessions - Math.round(stats.sessions * stats.bounceRate / 100), hint: ">1 página" },
              { label: "Leads (mensajes)", value: messagesCount, hint: "Conversión final" },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl bg-card border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Países</h2>
          </div>
          {stats.countries.length ? (
            <div className="space-y-2">
              {stats.countries.map((c) => {
                const max = stats.countries[0].count;
                return (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className="text-sm text-foreground w-32 truncate">{c.name}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${(c.count / max) * 100}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-foreground w-12 text-right">{c.count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin datos de geolocalización aún. Llegan progresivamente con cada visita.</p>
          )}
        </div>
        <div className="rounded-xl bg-card border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="w-5 h-5 text-accent" />
            <h2 className="font-display text-lg font-bold text-foreground">Campañas UTM</h2>
          </div>
          {stats.campaigns.length || stats.sources.length ? (
            <div className="space-y-4">
              {stats.campaigns.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Campañas</p>
                  <div className="space-y-1">
                    {stats.campaigns.map((c) => (
                      <div key={c.name} className="flex items-center justify-between py-1 border-b border-border/50">
                        <span className="text-sm text-foreground truncate">{c.name}</span>
                        <span className="text-sm font-semibold text-accent">{c.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {stats.sources.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Fuentes</p>
                  <div className="space-y-1">
                    {stats.sources.map((c) => (
                      <div key={c.name} className="flex items-center justify-between py-1 border-b border-border/50">
                        <span className="text-sm text-foreground truncate">{c.name}</span>
                        <span className="text-sm font-semibold text-primary">{c.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Sin tráfico de campañas. Añade <code className="text-xs bg-muted px-1 rounded">?utm_source=...&amp;utm_campaign=...</code> a tus enlaces.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl bg-card border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Páginas más vistas</h2>
          </div>
          <div className="space-y-2">
            {stats.topPages.map((p) => (
              <div key={p.path} className="flex items-center justify-between gap-3 py-2 border-b border-border/50">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-foreground truncate">{p.path}</p>
                  {p.avgDur > 0 && <p className="text-[10px] text-muted-foreground">Tiempo medio: {formatDuration(p.avgDur)}</p>}
                </div>
                <span className="text-sm font-semibold text-primary">{p.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-card border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Link2 className="w-5 h-5 text-accent" />
            <h2 className="font-display text-lg font-bold text-foreground">Fuentes de tráfico</h2>
          </div>
          <div className="space-y-2">
            {stats.topReferrers.map((r) => (
              <div key={r.name} className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-foreground truncate">{r.name}</span>
                <span className="text-sm font-semibold text-accent">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl bg-card border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Dispositivos</h2>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.devices} dataKey="count" nameKey="name" outerRadius={70} label={(e: { name: string }) => e.name}>
                  {stats.devices.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl bg-card border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="w-5 h-5 text-accent" />
            <h2 className="font-display text-lg font-bold text-foreground">Navegadores</h2>
          </div>
          <div className="space-y-2">
            {stats.browsers.map((b) => (
              <div key={b.name} className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-foreground">{b.name}</span>
                <span className="text-sm font-semibold text-foreground">{b.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-card border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Tablet className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Sistemas operativos</h2>
          </div>
          <div className="space-y-2">
            {stats.os.map((o) => (
              <div key={o.name} className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-foreground">{o.name}</span>
                <span className="text-sm font-semibold text-foreground">{o.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
