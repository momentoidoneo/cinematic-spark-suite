import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import RichEditor from "@/components/admin/RichEditor";
import { Save, Eye, EyeOff, FileText } from "lucide-react";
import { toast } from "sonner";

interface LegalText {
  id: string;
  slug: string;
  title: string;
  content: string;
  is_published: boolean;
  updated_at: string;
}

const AdminLegalTexts = () => {
  const [texts, setTexts] = useState<LegalText[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<LegalText | null>(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchTexts = async () => {
    const { data } = await supabase.from("legal_texts").select("*").order("title");
    setTexts((data as LegalText[]) || []);
    setLoading(false);
    if (data && data.length > 0 && !selected) {
      setSelected(data[0] as LegalText);
      setContent((data[0] as LegalText).content);
    }
  };

  useEffect(() => { fetchTexts(); }, []);

  const selectText = (text: LegalText) => {
    setSelected(text);
    setContent(text.content);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    const { error } = await supabase.from("legal_texts").update({ content }).eq("id", selected.id);
    if (error) { toast.error(error.message); }
    else { toast.success(`"${selected.title}" guardado`); fetchTexts(); }
    setSaving(false);
  };

  const togglePublished = async () => {
    if (!selected) return;
    const { error } = await supabase.from("legal_texts").update({ is_published: !selected.is_published }).eq("id", selected.id);
    if (error) { toast.error(error.message); }
    else { toast.success(selected.is_published ? "Despublicado" : "Publicado"); fetchTexts(); }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-2">Textos Legales</h1>
      <p className="text-sm text-muted-foreground mb-6">Edita los textos legales de tu sitio web</p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          {texts.map((text) => (
            <button
              key={text.id}
              onClick={() => selectText(text)}
              className={`w-full text-left p-3 rounded-xl border transition-colors ${
                selected?.id === text.id
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-card border-border text-foreground hover:bg-secondary"
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{text.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {text.is_published ? "Publicado" : "Borrador"} · {new Date(text.updated_at).toLocaleDateString("es-ES")}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          {selected ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">{selected.title}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={togglePublished}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${
                      selected.is_published
                        ? "border-green-500/30 text-green-400 hover:bg-green-500/10"
                        : "border-border text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {selected.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {selected.is_published ? "Publicado" : "Borrador"}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
              <RichEditor content={content} onChange={setContent} placeholder="Escribe el texto legal aquí..." />
            </div>
          ) : (
            <div className="rounded-xl bg-card border border-border p-12 text-center">
              <p className="text-muted-foreground">Selecciona un texto legal para editarlo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLegalTexts;
