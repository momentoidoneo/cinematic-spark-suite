import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, X, ToggleLeft, ToggleRight, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

interface Option {
  id: string;
  category: string;
  label: string;
  description: string | null;
  option_type: string;
  base_price: number;
  unit: string | null;
  min_qty: number;
  max_qty: number;
  multiplier: number;
  order: number;
  is_visible: boolean;
}

const TYPES = [
  { value: "base", label: "Base (servicio principal)" },
  { value: "addon", label: "Extra opcional" },
  { value: "quantity", label: "Cantidad (precio × N)" },
  { value: "multiplier", label: "Multiplicador (urgencia, complejidad)" },
];

const emptyForm = {
  category: "fotografia", label: "", description: "", option_type: "base",
  base_price: 0, unit: "", min_qty: 1, max_qty: 10, multiplier: 1, is_visible: true,
};

const AdminQuoteCalculator = () => {
  const [items, setItems] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Option | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchItems = async () => {
    const { data } = await supabase.from("quote_calculator_options").select("*").order("category").order("order");
    setItems((data as Option[]) || []);
    setLoading(false);
  };
  useEffect(() => { fetchItems(); }, []);

  const openCreate = () => { setForm(emptyForm); setCreating(true); setEditing(null); };
  const openEdit = (o: Option) => {
    setForm({
      category: o.category, label: o.label, description: o.description || "", option_type: o.option_type,
      base_price: o.base_price, unit: o.unit || "", min_qty: o.min_qty, max_qty: o.max_qty,
      multiplier: o.multiplier, is_visible: o.is_visible,
    });
    setEditing(o); setCreating(false);
  };
  const closeForm = () => { setEditing(null); setCreating(false); setForm(emptyForm); };

  const handleSave = async () => {
    if (!form.label.trim()) { toast.error("Etiqueta obligatoria"); return; }
    const payload = {
      category: form.category.trim().toLowerCase(),
      label: form.label.trim(),
      description: form.description.trim() || null,
      option_type: form.option_type,
      base_price: form.base_price,
      unit: form.unit.trim() || null,
      min_qty: form.min_qty,
      max_qty: form.max_qty,
      multiplier: form.multiplier,
      is_visible: form.is_visible,
      order: editing ? editing.order : items.filter(i => i.category === form.category).length,
    };
    const { error } = editing
      ? await supabase.from("quote_calculator_options").update(payload).eq("id", editing.id)
      : await supabase.from("quote_calculator_options").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Guardado"); closeForm(); fetchItems();
  };
  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar?")) return;
    await supabase.from("quote_calculator_options").delete().eq("id", id);
    fetchItems();
  };
  const toggleVisible = async (o: Option) => {
    await supabase.from("quote_calculator_options").update({ is_visible: !o.is_visible }).eq("id", o.id);
    fetchItems();
  };

  const grouped = items.reduce<Record<string, Option[]>>((acc, o) => {
    (acc[o.category] = acc[o.category] || []).push(o);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Calculadora de presupuesto</h1>
          <p className="text-sm text-muted-foreground mt-1">Variables y rangos para el widget público en /precios.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Nueva opción
        </button>
      </div>

      {(creating || editing) && (
        <div className="mb-6 p-5 rounded-xl bg-card border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{editing ? "Editar opción" : "Nueva opción"}</h2>
            <button onClick={closeForm} className="p-1 rounded-md hover:bg-secondary"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Categoría (servicio)</label>
              <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm" placeholder="fotografia / video / dron / tour" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Tipo</label>
              <select value={form.option_type} onChange={e => setForm({ ...form, option_type: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm">
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} className="md:col-span-2 px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm" placeholder="Etiqueta visible *" />
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="md:col-span-2 px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm" placeholder="Descripción (opcional)" />
            <div>
              <label className="text-xs text-muted-foreground">Precio base (€)</label>
              <input type="number" value={form.base_price} onChange={e => setForm({ ...form, base_price: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Unidad (foto, m², hora…)</label>
              <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm" />
            </div>
            {(form.option_type === "quantity") && (
              <>
                <div>
                  <label className="text-xs text-muted-foreground">Cantidad mín.</label>
                  <input type="number" value={form.min_qty} onChange={e => setForm({ ...form, min_qty: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Cantidad máx.</label>
                  <input type="number" value={form.max_qty} onChange={e => setForm({ ...form, max_qty: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm" />
                </div>
              </>
            )}
            {form.option_type === "multiplier" && (
              <div>
                <label className="text-xs text-muted-foreground">Multiplicador (ej: 1.3)</label>
                <input type="number" step="0.1" value={form.multiplier} onChange={e => setForm({ ...form, multiplier: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm" />
              </div>
            )}
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_visible} onChange={e => setForm({ ...form, is_visible: e.target.checked })} /> Visible
            </label>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={closeForm} className="px-4 py-2 rounded-lg bg-secondary text-sm">Cancelar</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Guardar</button>
          </div>
        </div>
      )}

      {loading ? <p className="text-muted-foreground">Cargando…</p> : Object.keys(grouped).length === 0 ? (
        <div className="p-10 text-center rounded-xl border border-dashed border-border text-muted-foreground">
          Sin opciones todavía. Crea una base (ej: "Fotografía inmobiliaria, 250 €") y luego añade extras.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, opts]) => (
            <div key={cat}>
              <h3 className="font-display text-lg text-foreground mb-2 capitalize">{cat}</h3>
              <div className="grid gap-2">
                {opts.map(o => (
                  <div key={o.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-foreground">{o.label}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{o.option_type}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {o.base_price > 0 && `€${o.base_price}`}
                        {o.unit && ` / ${o.unit}`}
                        {o.option_type === "quantity" && ` · ${o.min_qty}-${o.max_qty}`}
                        {o.option_type === "multiplier" && ` · ×${o.multiplier}`}
                      </p>
                    </div>
                    <button onClick={() => toggleVisible(o)} className="p-2 rounded-md hover:bg-secondary">
                      {o.is_visible ? <ToggleRight className="w-5 h-5 text-primary" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                    </button>
                    <button onClick={() => openEdit(o)} className="p-2 rounded-md hover:bg-secondary"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(o.id)} className="p-2 rounded-md hover:bg-secondary text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminQuoteCalculator;