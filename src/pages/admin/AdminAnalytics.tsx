import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Eye, TrendingUp, Calendar, ArrowUp, ArrowDown } from "lucide-react";

const AdminAnalytics = () => {
  const [stats, setStats] = useState({
    totalViews: 0,
    todayViews: 0,
    weekViews: 0,
    topPages: [] as { page_path: string; count: number }[],
    categories: 0,
    subcategories: 0,
    images: 0,
    blogPosts: 0,
    promotions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [total, today, week, cats, subs, imgs, posts, promos] = await Promise.all([
        supabase.from("page_views").select("id", { count: "exact", head: true }),
        supabase.from("page_views").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
        supabase.from("page_views").select("id", { count: "exact", head: true }).gte("created_at", weekStart),
        supabase.from("portfolio_categories").select("id", { count: "exact", head: true }),
        supabase.from("portfolio_subcategories").select("id", { count: "exact", head: true }),
        supabase.from("portfolio_images").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
        supabase.from("promotions").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        totalViews: total.count ?? 0,
        todayViews: today.count ?? 0,
        weekViews: week.count ?? 0,
        topPages: [],
        categories: cats.count ?? 0,
        subcategories: subs.count ?? 0,
        images: imgs.count ?? 0,
        blogPosts: posts.count ?? 0,
        promotions: promos.count ?? 0,
      });
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  const viewCards = [
    { label: "Visitas Hoy", value: stats.todayViews, icon: Eye, color: "text-green-400" },
    { label: "Visitas Semana", value: stats.weekViews, icon: TrendingUp, color: "text-blue-400" },
    { label: "Visitas Totales", value: stats.totalViews, icon: BarChart3, color: "text-primary" },
  ];

  const contentCards = [
    { label: "Categorías", value: stats.categories },
    { label: "Subcategorías", value: stats.subcategories },
    { label: "Imágenes", value: stats.images },
    { label: "Artículos Blog", value: stats.blogPosts },
    { label: "Promociones", value: stats.promotions },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-2">Analytics</h1>
      <p className="text-sm text-muted-foreground mb-6">Estadísticas y métricas de tu sitio web</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {viewCards.map((c) => (
          <div key={c.label} className="rounded-xl bg-card border border-border p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <p className="text-3xl font-bold text-foreground mt-1">{c.value}</p>
            </div>
            <c.icon className={`w-10 h-10 ${c.color} opacity-60`} />
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-foreground mb-4">Resumen de Contenido</h2>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {contentCards.map((c) => (
          <div key={c.label} className="rounded-xl bg-card border border-border p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{c.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl bg-card border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Tracking de Visitas</h2>
        <p className="text-sm text-muted-foreground">
          Las visitas se registran automáticamente. Para activar el tracking en la web pública, añade el componente de analytics en las páginas que quieras rastrear.
        </p>
      </div>
    </div>
  );
};

export default AdminAnalytics;
