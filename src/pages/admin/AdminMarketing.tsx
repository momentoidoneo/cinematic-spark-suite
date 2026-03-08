import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone, Instagram, Share2, Calendar, ExternalLink, Plus, Image } from "lucide-react";

const AdminMarketing = () => {
  const [stats, setStats] = useState({ socialLinks: 0, promotions: 0, blogPosts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [social, promos, posts] = await Promise.all([
        supabase.from("social_links").select("id", { count: "exact", head: true }),
        supabase.from("promotions").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        socialLinks: social.count ?? 0,
        promotions: promos.count ?? 0,
        blogPosts: posts.count ?? 0,
      });
      setLoading(false);
    };
    fetch();
  }, []);

  const quickLinks = [
    { label: "Gestionar Redes Sociales", description: "Configura tus perfiles y enlaces sociales", url: "/admin/social", icon: Share2, color: "text-pink-400" },
    { label: "Gestionar Promociones", description: "Crea ofertas y códigos de descuento", url: "/admin/promotions", icon: Megaphone, color: "text-yellow-400" },
    { label: "Escribir Artículo", description: "Publica contenido en tu blog", url: "/admin/blog", icon: Calendar, color: "text-blue-400" },
    { label: "Galería de Imágenes", description: "Sube y organiza tus fotos", url: "/admin/images", icon: Image, color: "text-green-400" },
  ];

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-2">Marketing & RRSS</h1>
      <p className="text-sm text-muted-foreground mb-6">Centro de control de marketing y redes sociales</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl bg-card border border-border p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Redes Sociales</p>
            <p className="text-3xl font-bold text-foreground mt-1">{stats.socialLinks}</p>
          </div>
          <Instagram className="w-10 h-10 text-pink-400 opacity-60" />
        </div>
        <div className="rounded-xl bg-card border border-border p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Promociones Activas</p>
            <p className="text-3xl font-bold text-foreground mt-1">{stats.promotions}</p>
          </div>
          <Megaphone className="w-10 h-10 text-yellow-400 opacity-60" />
        </div>
        <div className="rounded-xl bg-card border border-border p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Artículos Blog</p>
            <p className="text-3xl font-bold text-foreground mt-1">{stats.blogPosts}</p>
          </div>
          <Calendar className="w-10 h-10 text-blue-400 opacity-60" />
        </div>
      </div>

      <h2 className="text-lg font-semibold text-foreground mb-4">Acciones Rápidas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickLinks.map((link) => (
          <a
            key={link.label}
            href={link.url}
            className="rounded-xl bg-card border border-border p-5 flex items-start gap-4 hover:border-primary/30 hover:bg-primary/5 transition-colors group"
          >
            <link.icon className={`w-8 h-8 ${link.color} shrink-0 mt-0.5`} />
            <div className="flex-1">
              <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{link.label}</p>
              <p className="text-sm text-muted-foreground">{link.description}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default AdminMarketing;
