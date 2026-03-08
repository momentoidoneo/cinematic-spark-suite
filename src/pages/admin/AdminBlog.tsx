import { FileText } from "lucide-react";

const AdminBlog = () => (
  <div>
    <h1 className="font-display text-3xl font-bold text-foreground mb-2">Blog</h1>
    <p className="text-muted-foreground mb-8">Publica y gestiona artículos del blog</p>
    <div className="rounded-xl bg-card border border-border p-12 flex flex-col items-center justify-center text-center">
      <FileText className="w-12 h-12 text-muted-foreground/40 mb-4" />
      <p className="text-muted-foreground">Próximamente: editor de artículos con vista previa, categorías y SEO.</p>
    </div>
  </div>
);

export default AdminBlog;
