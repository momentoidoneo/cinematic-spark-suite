import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar, Sparkles, FolderOpen, BarChart3, Plus, Trash2, Send,
  Instagram, Youtube, Clock, CheckCircle2, FileText, Hash, Lightbulb,
  TrendingUp, Eye, Copy, Wand2, Globe, Music
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import {
  useSocialContent, useSocialContentBank, useSocialAnalytics, useGenerateSocialContent,
} from "@/hooks/useSocialMarketing";

const platformIcons: Record<string, React.ReactNode> = {
  instagram: <Instagram className="w-4 h-4" />,
  tiktok: <Music className="w-4 h-4" />,
  youtube: <Youtube className="w-4 h-4" />,
  facebook: <Globe className="w-4 h-4" />,
};

const platformColors: Record<string, string> = {
  instagram: "bg-pink-500/10 text-pink-500",
  tiktok: "bg-foreground/10 text-foreground",
  youtube: "bg-red-500/10 text-red-500",
  facebook: "bg-blue-500/10 text-blue-500",
};

const statusIcons: Record<string, React.ReactNode> = {
  draft: <FileText className="w-3.5 h-3.5" />,
  scheduled: <Clock className="w-3.5 h-3.5" />,
  published: <CheckCircle2 className="w-3.5 h-3.5" />,
};

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-blue-500/10 text-blue-500",
  published: "bg-green-500/10 text-green-500",
};

// ─── Content Calendar ──────────────────────────────
function ContentCalendar() {
  const { contents, isLoading, createContent, deleteContent } = useSocialContent();
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [newContent, setNewContent] = useState({
    title: "", caption: "", platform: "instagram", content_type: "post",
    status: "draft", scheduled_at: "", campaign: "", hashtags: "",
  });

  const filtered = filter === "all" ? contents : contents.filter(c => c.platform === filter);

  const handleCreate = () => {
    if (!newContent.title) return toast.error("Añade un título");
    createContent.mutate({
      title: newContent.title,
      caption: newContent.caption || null,
      platform: newContent.platform,
      content_type: newContent.content_type,
      status: newContent.status,
      scheduled_at: newContent.scheduled_at || null,
      campaign: newContent.campaign || null,
      hashtags: newContent.hashtags ? newContent.hashtags.split(",").map(h => h.trim()) : [],
    }, {
      onSuccess: () => {
        setShowCreate(false);
        setNewContent({ title: "", caption: "", platform: "instagram", content_type: "post", status: "draft", scheduled_at: "", campaign: "", hashtags: "" });
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          {["all", "instagram", "tiktok", "youtube", "facebook"].map(p => (
            <Button key={p} variant={filter === p ? "default" : "outline"} size="sm" onClick={() => setFilter(p)}>
              {p === "all" ? "Todos" : <>{platformIcons[p]} <span className="ml-1.5 capitalize">{p}</span></>}
            </Button>
          ))}
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-1.5" />Nuevo</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nuevo Contenido</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Título</Label><Input value={newContent.title} onChange={e => setNewContent(p => ({ ...p, title: e.target.value }))} placeholder="Título del post" /></div>
              <div><Label>Caption</Label><Textarea value={newContent.caption} onChange={e => setNewContent(p => ({ ...p, caption: e.target.value }))} rows={3} placeholder="Escribe el caption..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Plataforma</Label>
                  <Select value={newContent.platform} onValueChange={v => setNewContent(p => ({ ...p, platform: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Tipo</Label>
                  <Select value={newContent.content_type} onValueChange={v => setNewContent(p => ({ ...p, content_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="post">Post</SelectItem>
                      <SelectItem value="story">Story</SelectItem>
                      <SelectItem value="reel">Reel</SelectItem>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Estado</Label>
                  <Select value={newContent.status} onValueChange={v => setNewContent(p => ({ ...p, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="scheduled">Programado</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Fecha programada</Label><Input type="datetime-local" value={newContent.scheduled_at} onChange={e => setNewContent(p => ({ ...p, scheduled_at: e.target.value }))} /></div>
              </div>
              <div><Label>Campaña</Label><Input value={newContent.campaign} onChange={e => setNewContent(p => ({ ...p, campaign: e.target.value }))} placeholder="Nombre de la campaña" /></div>
              <div><Label>Hashtags (separados por coma)</Label><Input value={newContent.hashtags} onChange={e => setNewContent(p => ({ ...p, hashtags: e.target.value }))} placeholder="#fotografia, #dron, #inmobiliaria" /></div>
              <Button onClick={handleCreate} disabled={createContent.isPending} className="w-full">
                {createContent.isPending ? "Creando..." : "Crear Contenido"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Cargando...</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No hay contenido. Crea tu primera publicación.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((item) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`p-1.5 rounded-md ${platformColors[item.platform]}`}>{platformIcons[item.platform]}</span>
                      <h4 className="font-medium text-sm truncate">{item.title}</h4>
                    </div>
                    <Badge variant="secondary" className={`text-[10px] shrink-0 ${statusColors[item.status]}`}>
                      <span className="mr-1">{statusIcons[item.status]}</span>
                      {item.status === "draft" ? "Borrador" : item.status === "scheduled" ? "Programado" : "Publicado"}
                    </Badge>
                  </div>
                  {item.caption && <p className="text-xs text-muted-foreground line-clamp-2">{item.caption}</p>}
                  {item.hashtags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.hashtags.slice(0, 4).map(h => (
                        <span key={h} className="text-[10px] text-primary/70">#{h.replace("#", "")}</span>
                      ))}
                      {item.hashtags.length > 4 && <span className="text-[10px] text-muted-foreground">+{item.hashtags.length - 4}</span>}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border">
                    <span>{item.content_type}</span>
                    {item.scheduled_at && <span>{format(new Date(item.scheduled_at), "dd MMM HH:mm", { locale: es })}</span>}
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteContent.mutate(item.id)}>
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AI Content Generator ──────────────────────────
function AIContentGenerator() {
  const generateContent = useGenerateSocialContent();
  const { createContent } = useSocialContent();
  const { createBankItem } = useSocialContentBank();
  const [params, setParams] = useState({
    platform: "instagram", contentType: "post", topic: "", tone: "profesional pero cercano",
    includeHashtags: true, includeEmojis: true, campaignContext: "",
  });
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!params.topic) return toast.error("Escribe un tema o idea");
    try {
      const data = await generateContent.mutateAsync(params);
      setResult(data);
    } catch { /* handled in hook */ }
  };

  const handleSaveToCalendar = () => {
    if (!result) return;
    createContent.mutate({
      title: result.title || params.topic,
      caption: result.caption,
      platform: params.platform,
      content_type: params.contentType,
      status: "draft",
      hashtags: result.hashtags || [],
      ai_generated: true,
    });
    toast.success("Guardado en el calendario");
  };

  const handleSaveToBank = () => {
    if (!result) return;
    createBankItem.mutate({
      name: result.title || params.topic,
      type: "text",
      content: JSON.stringify(result),
      category: params.platform,
      tags: result.hashtags?.slice(0, 5) || [],
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Wand2 className="w-4 h-4 text-primary" />Configuración</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Plataforma</Label>
              <Select value={params.platform} onValueChange={v => setParams(p => ({ ...p, platform: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Tipo</Label>
              <Select value={params.contentType} onValueChange={v => setParams(p => ({ ...p, contentType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="post">Post</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                  <SelectItem value="reel">Reel/Short</SelectItem>
                  <SelectItem value="video">Video largo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Tema / Idea</Label><Textarea value={params.topic} onChange={e => setParams(p => ({ ...p, topic: e.target.value }))} rows={3} placeholder="Ej: Sesión fotográfica de un ático de lujo, vídeo detrás de cámaras de un vuelo con dron..." /></div>
          <div><Label>Tono</Label><Input value={params.tone} onChange={e => setParams(p => ({ ...p, tone: e.target.value }))} placeholder="profesional, creativo, inspirador..." /></div>
          <div><Label>Contexto de campaña (opcional)</Label><Input value={params.campaignContext} onChange={e => setParams(p => ({ ...p, campaignContext: e.target.value }))} placeholder="Lanzamiento servicio tour virtual..." /></div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm"><Switch checked={params.includeHashtags} onCheckedChange={v => setParams(p => ({ ...p, includeHashtags: v }))} />Hashtags</label>
            <label className="flex items-center gap-2 text-sm"><Switch checked={params.includeEmojis} onCheckedChange={v => setParams(p => ({ ...p, includeEmojis: v }))} />Emojis</label>
          </div>
          <Button onClick={handleGenerate} disabled={generateContent.isPending} className="w-full">
            <Sparkles className="w-4 h-4 mr-1.5" />
            {generateContent.isPending ? "Generando..." : "Generar con IA"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Lightbulb className="w-4 h-4 text-yellow-500" />Resultado</CardTitle>
        </CardHeader>
        <CardContent>
          {!result ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Configura y genera contenido con IA</div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-4 pr-2">
                {result.title && <div><Label className="text-xs text-muted-foreground">Título</Label><p className="font-medium">{result.title}</p></div>}
                {result.hook && <div><Label className="text-xs text-muted-foreground">Hook</Label><p className="text-sm text-primary font-medium">"{result.hook}"</p></div>}
                {result.caption && <div><Label className="text-xs text-muted-foreground">Caption</Label><p className="text-sm whitespace-pre-wrap">{result.caption}</p></div>}
                {result.hashtags?.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Hashtags</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.hashtags.map((h: string) => <Badge key={h} variant="secondary" className="text-xs">#{h.replace("#", "")}</Badge>)}
                    </div>
                  </div>
                )}
                {result.callToAction && <div><Label className="text-xs text-muted-foreground">Call to Action</Label><p className="text-sm">{result.callToAction}</p></div>}
                {result.bestTimeToPost && <div><Label className="text-xs text-muted-foreground">Mejor hora</Label><p className="text-sm">{result.bestTimeToPost}</p></div>}
                {result.contentTips?.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Tips</Label>
                    <ul className="text-xs space-y-1 mt-1">{result.contentTips.map((t: string, i: number) => <li key={i} className="flex gap-1.5"><span className="text-primary">•</span>{t}</li>)}</ul>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={handleSaveToCalendar}><Calendar className="w-3.5 h-3.5 mr-1" />Al calendario</Button>
                  <Button size="sm" variant="outline" onClick={handleSaveToBank}><FolderOpen className="w-3.5 h-3.5 mr-1" />Al banco</Button>
                  <Button size="sm" variant="ghost" onClick={() => {
                    const fullText = [result.title, result.hook, result.caption, result.hashtags?.map((h: string) => `#${h.replace("#","")}`).join(" ")].filter(Boolean).join("\n\n");
                    navigator.clipboard.writeText(fullText);
                    toast.success("Contenido completo copiado");
                  }}><Copy className="w-3.5 h-3.5 mr-1" />Copiar todo</Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Content Bank ──────────────────────────────────
function ContentBank() {
  const { bankItems, isLoading, createBankItem, deleteBankItem } = useSocialContentBank();
  const [showCreate, setShowCreate] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", type: "text" as const, content: "", category: "", tags: "" });

  const handleCreate = () => {
    if (!newItem.name) return toast.error("Añade un nombre");
    createBankItem.mutate({
      name: newItem.name,
      type: newItem.type,
      content: newItem.content || null,
      category: newItem.category || null,
      tags: newItem.tags ? newItem.tags.split(",").map(t => t.trim()) : [],
    }, { onSuccess: () => { setShowCreate(false); setNewItem({ name: "", type: "text", content: "", category: "", tags: "" }); } });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{bankItems.length} items guardados</p>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1.5" />Nuevo item</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuevo item al banco</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nombre</Label><Input value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} /></div>
              <div><Label>Tipo</Label>
                <Select value={newItem.type} onValueChange={v => setNewItem(p => ({ ...p, type: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="template">Plantilla</SelectItem>
                    <SelectItem value="image">Imagen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Contenido</Label><Textarea value={newItem.content} onChange={e => setNewItem(p => ({ ...p, content: e.target.value }))} rows={4} /></div>
              <div><Label>Categoría</Label><Input value={newItem.category} onChange={e => setNewItem(p => ({ ...p, category: e.target.value }))} /></div>
              <div><Label>Tags (coma)</Label><Input value={newItem.tags} onChange={e => setNewItem(p => ({ ...p, tags: e.target.value }))} /></div>
              <Button onClick={handleCreate} className="w-full">Guardar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <div className="text-center py-8 text-muted-foreground">Cargando...</div> : bankItems.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">El banco de contenido está vacío.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {bankItems.map(item => {
            const parsedContent = item.content && typeof item.content === 'string' && item.content.startsWith('{') ? (() => { try { return JSON.parse(item.content); } catch { return null; } })() : null;
            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow overflow-hidden">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm truncate">{item.name}</h4>
                    <div className="flex gap-1 shrink-0">
                      <Badge variant="outline" className="text-[10px]">{item.type}</Badge>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteBankItem.mutate(item.id)}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                    </div>
                  </div>
                  {parsedContent?.caption && <p className="text-xs text-muted-foreground line-clamp-2">{parsedContent.caption}</p>}
                  {!parsedContent && item.content && <p className="text-xs text-muted-foreground line-clamp-2">{item.content}</p>}
                  {item.tags?.length > 0 && <div className="flex flex-wrap gap-1">{item.tags.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}</div>}
                  <p className="text-[10px] text-muted-foreground">Usado {item.times_used} veces • {item.category || "Sin categoría"}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Analytics Dashboard ───────────────────────────
function AnalyticsDashboard() {
  const { analytics, isLoading, upsertAnalytics } = useSocialAnalytics();
  const [showAdd, setShowAdd] = useState(false);
  const [newEntry, setNewEntry] = useState({
    platform: "instagram", metric_date: format(new Date(), "yyyy-MM-dd"),
    followers: 0, likes: 0, comments: 0, shares: 0, reach: 0, impressions: 0, engagement_rate: 0, profile_views: 0, website_clicks: 0,
  });
  const [viewPlatform, setViewPlatform] = useState<string>("instagram");

  const platformData = analytics.filter(a => a.platform === viewPlatform).reverse();
  const latestByPlatform = (p: string) => analytics.find(a => a.platform === p);

  const handleSave = () => {
    upsertAnalytics.mutate(newEntry as any, { onSuccess: () => setShowAdd(false) });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {["instagram", "tiktok", "youtube", "facebook"].map(p => {
          const latest = latestByPlatform(p);
          return (
            <Card key={p} className={`cursor-pointer transition-all ${viewPlatform === p ? "ring-2 ring-primary" : ""}`} onClick={() => setViewPlatform(p)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`p-1.5 rounded-md ${platformColors[p] || "bg-muted text-muted-foreground"}`}>{platformIcons[p]}</span>
                  <span className="font-medium capitalize text-sm">{p}</span>
                </div>
                {latest ? (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div><p className="text-lg font-bold">{(latest.followers || 0).toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Seguidores</p></div>
                    <div><p className="text-lg font-bold">{(latest.engagement_rate || 0).toFixed(1)}%</p><p className="text-[10px] text-muted-foreground">Engagement</p></div>
                    <div><p className="text-lg font-bold">{(latest.reach || 0).toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Alcance</p></div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-2">Sin datos</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {platformData.length > 1 && (
        <>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Evolución de seguidores — <span className="capitalize">{viewPlatform}</span></CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={platformData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="metric_date" tick={{ fontSize: 10 }} tickFormatter={v => format(new Date(v), "dd/MM")} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip labelFormatter={v => format(new Date(v as string), "dd MMM yyyy", { locale: es })} />
                  <Line type="monotone" dataKey="followers" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Engagement — <span className="capitalize">{viewPlatform}</span></CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={platformData.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="metric_date" tick={{ fontSize: 10 }} tickFormatter={v => format(new Date(v), "dd/MM")} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip labelFormatter={v => format(new Date(v as string), "dd MMM yyyy", { locale: es })} />
                  <Bar dataKey="likes" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="comments" fill="hsl(var(--primary) / 0.5)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      <div className="flex justify-end">
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1.5" />Registrar métricas</Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Registrar métricas</DialogTitle></DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-3 pr-2">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Plataforma</Label>
                    <Select value={newEntry.platform} onValueChange={v => setNewEntry(p => ({ ...p, platform: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Fecha</Label><Input type="date" value={newEntry.metric_date} onChange={e => setNewEntry(p => ({ ...p, metric_date: e.target.value }))} /></div>
                </div>
                {[
                  { key: "followers", label: "Seguidores" }, { key: "likes", label: "Likes" },
                  { key: "comments", label: "Comentarios" }, { key: "shares", label: "Compartidos" },
                  { key: "reach", label: "Alcance" }, { key: "impressions", label: "Impresiones" },
                  { key: "engagement_rate", label: "Engagement (%)" }, { key: "profile_views", label: "Visitas perfil" },
                  { key: "website_clicks", label: "Clicks web" },
                ].map(({ key, label }) => (
                  <div key={key}><Label>{label}</Label><Input type="number" value={(newEntry as any)[key]} onChange={e => setNewEntry(p => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))} /></div>
                ))}
                <Button onClick={handleSave} disabled={upsertAnalytics.isPending} className="w-full">Guardar</Button>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// ─── Main Export ────────────────────────────────────
export function SocialMarketingManager() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Marketing & Redes Sociales</h1>
        <p className="text-sm text-muted-foreground">Gestiona tu contenido para Instagram, TikTok, YouTube y Facebook</p>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="w-full flex gap-1 h-auto p-1 overflow-x-auto">
          <TabsTrigger value="calendar" className="text-xs gap-1.5 flex-1 min-w-0"><Calendar className="w-3.5 h-3.5 shrink-0" /><span className="truncate">Calendario</span></TabsTrigger>
          <TabsTrigger value="ai" className="text-xs gap-1.5 flex-1 min-w-0"><Sparkles className="w-3.5 h-3.5 shrink-0" /><span className="truncate">Generador IA</span></TabsTrigger>
          <TabsTrigger value="bank" className="text-xs gap-1.5 flex-1 min-w-0"><FolderOpen className="w-3.5 h-3.5 shrink-0" /><span className="truncate">Banco</span></TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs gap-1.5 flex-1 min-w-0"><BarChart3 className="w-3.5 h-3.5 shrink-0" /><span className="truncate">Analytics</span></TabsTrigger>
        </TabsList>

        <TabsContent value="calendar"><ContentCalendar /></TabsContent>
        <TabsContent value="ai" forceMount className="data-[state=inactive]:hidden"><AIContentGenerator /></TabsContent>
        <TabsContent value="bank"><ContentBank /></TabsContent>
        <TabsContent value="analytics"><AnalyticsDashboard /></TabsContent>
      </Tabs>
    </div>
  );
}
