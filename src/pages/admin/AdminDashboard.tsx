import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FolderOpen, Layers, Image } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ categories: 0, subcategories: 0, images: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [cats, subs, imgs] = await Promise.all([
        supabase.from("portfolio_categories").select("id", { count: "exact", head: true }),
        supabase.from("portfolio_subcategories").select("id", { count: "exact", head: true }),
        supabase.from("portfolio_images").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        categories: cats.count ?? 0,
        subcategories: subs.count ?? 0,
        images: imgs.count ?? 0,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Categorías", value: stats.categories, icon: FolderOpen, color: "text-primary" },
    { label: "Subcategorías", value: stats.subcategories, icon: Layers, color: "text-accent" },
    { label: "Imágenes Totales", value: stats.images, icon: Image, color: "text-primary" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-foreground mb-2">Bienvenido al Panel de Administración</h1>
      <p className="text-muted-foreground mb-8">Gestiona el contenido visual de tu portafolio desde aquí</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl bg-card border border-border p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <p className="text-3xl font-bold text-foreground mt-1">{c.value}</p>
            </div>
            <c.icon className={`w-10 h-10 ${c.color} opacity-60`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
