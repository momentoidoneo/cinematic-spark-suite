import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar, Sparkles, FolderOpen, BarChart3, Plus, Trash2, Send,
  Instagram, Youtube, Clock, CheckCircle2, FileText, Hash, Lightbulb,
  TrendingUp, Eye, Copy, Wand2, Globe, Music, RefreshCw, Link2,
  ArrowRightLeft, Search, Video, AlertCircle, ExternalLink, XCircle,
  Bookmark, Play, Pause, RotateCcw, Shield, Unplug
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
import {
  usePlatformConnections, usePublishQueue, usePublishLogs, useFetchAnalytics, useRepurposeContent,
} from "@/hooks/usePublishQueue";
import { InstagramProspecting } from "@/components/admin/InstagramProspecting";
import { supabase } from "@/integrations/supabase/client";

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
  pending: <Clock className="w-3.5 h-3.5" />,
  failed: <AlertCircle className="w-3.5 h-3.5" />,
  cancelled: <XCircle className="w-3.5 h-3.5" />,
};

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-blue-500/10 text-blue-500",
  published: "bg-green-500/10 text-green-500",
  pending: "bg-yellow-500/10 text-yellow-500",
  failed: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
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
        <div className="flex gap-2 flex-wrap">
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
                    <SelectItem value="video">Vídeo</SelectItem>
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

// ─── Repurposing ───────────────────────────────────
function RepurposingTab() {
  const repurpose = useRepurposeContent();
  const { contents } = useSocialContent();
  const { createContent } = useSocialContent();
  const [selectedContentId, setSelectedContentId] = useState<string>("");
  const [sourcePlatform, setSourcePlatform] = useState("instagram");
  const [targetPlatform, setTargetPlatform] = useState("tiktok");
  const [contentType, setContentType] = useState("post");
  const [customText, setCustomText] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleRepurpose = async () => {
    const selectedContent = contents.find(c => c.id === selectedContentId);
    const source = selectedContent
      ? { title: selectedContent.title, caption: selectedContent.caption, hashtags: selectedContent.hashtags }
      : customText;
    if (!source || (typeof source === "string" && !source.trim())) return toast.error("Selecciona contenido o escribe texto");
    try {
      const data = await repurpose.mutateAsync({ sourceContent: source, sourcePlatform, targetPlatform, contentType });
      setResult(data);
      toast.success("Contenido adaptado");
    } catch { /* handled */ }
  };

  const handleSave = () => {
    if (!result) return;
    createContent.mutate({
      title: result.title || "Contenido adaptado",
      caption: result.caption,
      platform: targetPlatform,
      content_type: contentType,
      status: "draft",
      hashtags: result.hashtags || [],
      ai_generated: true,
    });
    toast.success("Guardado en calendario");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><ArrowRightLeft className="w-4 h-4 text-primary" />Adaptar contenido</CardTitle>
          <CardDescription>Transforma contenido de una plataforma a otra con IA</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Contenido existente (opcional)</Label>
            <Select value={selectedContentId} onValueChange={setSelectedContentId}>
              <SelectTrigger><SelectValue placeholder="Selecciona del calendario..." /></SelectTrigger>
              <SelectContent>
                {contents.map(c => <SelectItem key={c.id} value={c.id}>{c.title} ({c.platform})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>O escribe texto manualmente</Label>
            <Textarea value={customText} onChange={e => setCustomText(e.target.value)} rows={4} placeholder="Pega aquí el caption o contenido original..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Plataforma origen</Label>
              <Select value={sourcePlatform} onValueChange={setSourcePlatform}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Plataforma destino</Label>
              <Select value={targetPlatform} onValueChange={setTargetPlatform}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Formato destino</Label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="post">Post</SelectItem>
                <SelectItem value="reel">Reel/Short</SelectItem>
                <SelectItem value="story">Story</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleRepurpose} disabled={repurpose.isPending} className="w-full">
            <ArrowRightLeft className="w-4 h-4 mr-1.5" />
            {repurpose.isPending ? "Adaptando..." : "Adaptar con IA"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Lightbulb className="w-4 h-4 text-yellow-500" />Resultado adaptado</CardTitle>
        </CardHeader>
        <CardContent>
          {!result ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Selecciona contenido y plataforma destino para adaptar</div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-2">
                {result.title && <div><Label className="text-xs text-muted-foreground">Título</Label><p className="font-medium">{result.title}</p></div>}
                {result.hook && <div><Label className="text-xs text-muted-foreground">Hook</Label><p className="text-sm text-primary font-medium">"{result.hook}"</p></div>}
                {result.caption && <div><Label className="text-xs text-muted-foreground">Caption</Label><p className="text-sm whitespace-pre-wrap">{result.caption}</p></div>}
                {result.hashtags?.length > 0 && (
                  <div><Label className="text-xs text-muted-foreground">Hashtags</Label>
                    <div className="flex flex-wrap gap-1 mt-1">{result.hashtags.map((h: string) => <Badge key={h} variant="secondary" className="text-xs">#{h.replace("#","")}</Badge>)}</div>
                  </div>
                )}
                {result.callToAction && <div><Label className="text-xs text-muted-foreground">CTA</Label><p className="text-sm">{result.callToAction}</p></div>}
                {result.formatNotes && <div><Label className="text-xs text-muted-foreground">Notas de formato</Label><p className="text-sm">{result.formatNotes}</p></div>}
                {result.visualSuggestions && <div><Label className="text-xs text-muted-foreground">Sugerencias visuales</Label><p className="text-sm">{result.visualSuggestions}</p></div>}
                {result.adaptationNotes && <div><Label className="text-xs text-muted-foreground">Notas de adaptación</Label><p className="text-sm text-muted-foreground">{result.adaptationNotes}</p></div>}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={handleSave}><Calendar className="w-3.5 h-3.5 mr-1" />Guardar en calendario</Button>
                  <Button size="sm" variant="ghost" onClick={() => {
                    navigator.clipboard.writeText([result.title, result.caption, result.hashtags?.map((h: string) => `#${h.replace("#","")}`).join(" ")].filter(Boolean).join("\n\n"));
                    toast.success("Copiado");
                  }}><Copy className="w-3.5 h-3.5 mr-1" />Copiar</Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Publish Queue ─────────────────────────────────
function PublishTab() {
  const { queue, isLoading, enqueue, publish, cancel } = usePublishQueue();
  const { logs } = usePublishLogs();
  const { contents } = useSocialContent();
  const [showEnqueue, setShowEnqueue] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState("");
  const [publishPlatform, setPublishPlatform] = useState("");

  const draftContents = contents.filter(c => c.status !== "published");

  const handleEnqueue = () => {
    if (!selectedContentId) return toast.error("Selecciona un contenido");
    enqueue.mutate({ contentId: selectedContentId, platform: publishPlatform || undefined }, {
      onSuccess: () => { setShowEnqueue(false); setSelectedContentId(""); },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{queue.length} items en cola</p>
        <Dialog open={showEnqueue} onOpenChange={setShowEnqueue}>
          <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1.5" />Añadir a cola</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Encolar publicación</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Contenido</Label>
                <Select value={selectedContentId} onValueChange={setSelectedContentId}>
                  <SelectTrigger><SelectValue placeholder="Selecciona contenido..." /></SelectTrigger>
                  <SelectContent>
                    {draftContents.map(c => <SelectItem key={c.id} value={c.id}>{c.title} ({c.platform})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Plataforma (opcional, por defecto la del contenido)</Label>
                <Select value={publishPlatform} onValueChange={setPublishPlatform}>
                  <SelectTrigger><SelectValue placeholder="Automático" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleEnqueue} disabled={enqueue.isPending} className="w-full">Encolar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <div className="text-center py-8 text-muted-foreground">Cargando...</div> : queue.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">La cola de publicación está vacía.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {queue.map(item => (
            <Card key={item.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`p-1.5 rounded-md ${platformColors[item.platform] || "bg-muted"}`}>{platformIcons[item.platform]}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.title || "Sin título"}</p>
                    <p className="text-[10px] text-muted-foreground">{item.publish_mode} • Intento {item.attempt_count}/{item.max_attempts}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className={`text-[10px] ${statusColors[item.status] || ""}`}>
                    {statusIcons[item.status]}<span className="ml-1">{item.status}</span>
                  </Badge>
                  {item.status === "pending" && (
                    <>
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => publish.mutate(item.id)} disabled={publish.isPending}>
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => cancel.mutate({ queueId: item.id })}>
                        <XCircle className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </>
                  )}
                  {item.platform_post_url && (
                    <a href={item.platform_post_url} target="_blank" rel="noopener noreferrer">
                      <Button size="icon" variant="ghost" className="h-7 w-7"><ExternalLink className="w-3.5 h-3.5" /></Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {logs.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Últimos logs de publicación</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-1">
                {logs.slice(0, 20).map(log => (
                  <div key={log.id} className="flex items-center justify-between text-xs py-1.5 border-b border-border last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`p-1 rounded ${platformColors[log.platform] || ""}`}>{platformIcons[log.platform]}</span>
                      <span>{log.action}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={log.status === "success" ? "default" : "destructive"} className="text-[10px]">{log.status}</Badge>
                      {log.duration_ms && <span className="text-muted-foreground">{log.duration_ms}ms</span>}
                      <span className="text-muted-foreground">{format(new Date(log.created_at), "dd/MM HH:mm")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Platform Connections ──────────────────────────
function ConnectionsTab() {
  const { connections, isLoading, upsertConnection, deleteConnection, verifyConnection } = usePlatformConnections();
  const [showAdd, setShowAdd] = useState(false);
  const [newConn, setNewConn] = useState({ platform: "instagram", account_name: "", account_id: "", access_token: "" });

  const handleSave = () => {
    if (!newConn.platform) return;
    upsertConnection.mutate({
      platform: newConn.platform,
      account_name: newConn.account_name || null,
      account_id: newConn.account_id || null,
      access_token: newConn.access_token || null,
      connection_status: newConn.access_token ? "connected" : "pending",
      is_active: true,
    }, { onSuccess: () => { setShowAdd(false); setNewConn({ platform: "instagram", account_name: "", account_id: "", access_token: "" }); } });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{connections.length} conexiones configuradas</p>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1.5" />Nueva conexión</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Configurar conexión</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Plataforma</Label>
                <Select value={newConn.platform} onValueChange={v => setNewConn(p => ({ ...p, platform: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Nombre de cuenta</Label><Input value={newConn.account_name} onChange={e => setNewConn(p => ({ ...p, account_name: e.target.value }))} placeholder="@silviocosta" /></div>
              <div><Label>Account ID</Label><Input value={newConn.account_id} onChange={e => setNewConn(p => ({ ...p, account_id: e.target.value }))} placeholder="ID de la cuenta" /></div>
              <div><Label>Access Token</Label><Input type="password" value={newConn.access_token} onChange={e => setNewConn(p => ({ ...p, access_token: e.target.value }))} placeholder="Token de acceso" /></div>
              <Button onClick={handleSave} disabled={upsertConnection.isPending} className="w-full">Guardar conexión</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <div className="text-center py-8 text-muted-foreground">Cargando...</div> : connections.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No hay conexiones configuradas. Añade tu primera plataforma.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {connections.map(conn => (
            <Card key={conn.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-md ${platformColors[conn.platform] || "bg-muted"}`}>{platformIcons[conn.platform]}</span>
                    <div>
                      <p className="font-medium text-sm capitalize">{conn.platform}</p>
                      {conn.account_name && <p className="text-xs text-muted-foreground">{conn.account_name}</p>}
                    </div>
                  </div>
                  <Badge variant={conn.connection_status === "connected" ? "default" : "secondary"} className="text-[10px]">
                    {conn.connection_status === "connected" ? <><CheckCircle2 className="w-3 h-3 mr-1" />Conectado</> : <><Clock className="w-3 h-3 mr-1" />Pendiente</>}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => verifyConnection.mutate(conn.platform)} disabled={verifyConnection.isPending}>
                    <Shield className="w-3.5 h-3.5 mr-1" />Verificar
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteConnection.mutate(conn.id)}>
                    <Unplug className="w-3.5 h-3.5 mr-1" />Desconectar
                  </Button>
                </div>
                {conn.last_verified_at && <p className="text-[10px] text-muted-foreground mt-2">Verificado: {format(new Date(conn.last_verified_at), "dd/MM/yyyy HH:mm")}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Saved Prospects ───────────────────────────────
function SavedProspectsTab() {
  const [prospects, setProspects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.from("saved_prospects").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setProspects(data || []);
      setIsLoading(false);
    });
  }, []);

  const handleDelete = async (id: string) => {
    await supabase.from("saved_prospects").delete().eq("id", id);
    setProspects(p => p.filter(x => x.id !== id));
    toast.success("Prospecto eliminado");
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{prospects.length} prospectos guardados</p>
      {isLoading ? <div className="text-center py-8 text-muted-foreground">Cargando...</div> : prospects.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No hay prospectos guardados. Usa la pestaña Prospección para encontrar leads.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {prospects.map(p => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-sm">@{p.username}</h4>
                    {p.profile_title && <p className="text-xs text-muted-foreground">{p.profile_title}</p>}
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(p.id)}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                </div>
                {p.profile_description && <p className="text-xs text-muted-foreground line-clamp-2">{p.profile_description}</p>}
                {p.generated_dms && (
                  <div className="bg-muted/50 rounded-md p-2">
                    <Label className="text-[10px] text-muted-foreground">DM generado</Label>
                    <p className="text-xs line-clamp-3">{p.generated_dms}</p>
                    <Button size="sm" variant="ghost" className="h-6 mt-1 text-xs" onClick={() => { navigator.clipboard.writeText(p.generated_dms); toast.success("DM copiado"); }}>
                      <Copy className="w-3 h-3 mr-1" />Copiar
                    </Button>
                  </div>
                )}
                {p.profile_url && (
                  <a href={p.profile_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />Ver perfil
                  </a>
                )}
                <p className="text-[10px] text-muted-foreground">{format(new Date(p.created_at), "dd/MM/yyyy HH:mm")}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Video Tab ─────────────────────────────────────
function VideoTab() {
  const { contents } = useSocialContent();
  const videoContents = contents.filter(c => c.content_type === "video" || c.content_type === "reel" || c.content_type === "short");

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium">Contenido de vídeo</h3>
          <p className="text-xs text-muted-foreground">Reels, Shorts y vídeos largos de todas las plataformas</p>
        </div>
        <Badge variant="secondary">{videoContents.length} vídeos</Badge>
      </div>

      {videoContents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Video className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No hay contenido de vídeo todavía.</p>
            <p className="text-xs mt-1">Crea reels, shorts o vídeos desde el Calendario o el Generador IA.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {videoContents.map(item => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-md ${platformColors[item.platform]}`}>{platformIcons[item.platform]}</span>
                  <div className="min-w-0">
                    <h4 className="font-medium text-sm truncate">{item.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{item.content_type}</Badge>
                      <Badge className={`text-[10px] ${statusColors[item.status]}`}>{item.status}</Badge>
                    </div>
                  </div>
                </div>
                {item.caption && <p className="text-xs text-muted-foreground line-clamp-2">{item.caption}</p>}
                {item.video_url && (
                  <a href={item.video_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Play className="w-3 h-3" />Ver vídeo
                  </a>
                )}
                {item.scheduled_at && <p className="text-[10px] text-muted-foreground">{format(new Date(item.scheduled_at), "dd MMM HH:mm", { locale: es })}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Analytics Dashboard ───────────────────────────
function AnalyticsDashboard() {
  const { analytics, isLoading, upsertAnalytics } = useSocialAnalytics();
  const fetchAnalytics = useFetchAnalytics();
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
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => fetchAnalytics.mutate()} disabled={fetchAnalytics.isPending}>
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${fetchAnalytics.isPending ? "animate-spin" : ""}`} />
          {fetchAnalytics.isPending ? "Obteniendo..." : "Actualizar métricas"}
        </Button>
      </div>

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
        <p className="text-sm text-muted-foreground">Gestiona contenido, publicaciones, prospección y analíticas para todas las plataformas</p>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="w-full flex gap-1 h-auto p-1">
            <TabsTrigger value="calendar" className="text-xs gap-1 flex-shrink-0"><Calendar className="w-3.5 h-3.5" /><span className="hidden sm:inline">Calendario</span></TabsTrigger>
            <TabsTrigger value="ai" className="text-xs gap-1 flex-shrink-0"><Sparkles className="w-3.5 h-3.5" /><span className="hidden sm:inline">IA</span></TabsTrigger>
            <TabsTrigger value="video" className="text-xs gap-1 flex-shrink-0"><Video className="w-3.5 h-3.5" /><span className="hidden sm:inline">Vídeo</span></TabsTrigger>
            <TabsTrigger value="repurpose" className="text-xs gap-1 flex-shrink-0"><ArrowRightLeft className="w-3.5 h-3.5" /><span className="hidden sm:inline">Repurposing</span></TabsTrigger>
            <TabsTrigger value="bank" className="text-xs gap-1 flex-shrink-0"><FolderOpen className="w-3.5 h-3.5" /><span className="hidden sm:inline">Banco</span></TabsTrigger>
            <TabsTrigger value="publish" className="text-xs gap-1 flex-shrink-0"><Send className="w-3.5 h-3.5" /><span className="hidden sm:inline">Publicar</span></TabsTrigger>
            <TabsTrigger value="prospects" className="text-xs gap-1 flex-shrink-0"><Search className="w-3.5 h-3.5" /><span className="hidden sm:inline">Prospección</span></TabsTrigger>
            <TabsTrigger value="saved" className="text-xs gap-1 flex-shrink-0"><Bookmark className="w-3.5 h-3.5" /><span className="hidden sm:inline">Guardados</span></TabsTrigger>
            <TabsTrigger value="connections" className="text-xs gap-1 flex-shrink-0"><Link2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">Conexiones</span></TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs gap-1 flex-shrink-0"><BarChart3 className="w-3.5 h-3.5" /><span className="hidden sm:inline">Analytics</span></TabsTrigger>
          </TabsList>
        </ScrollArea>

        <TabsContent value="calendar"><ContentCalendar /></TabsContent>
        <TabsContent value="ai" forceMount className="data-[state=inactive]:hidden"><AIContentGenerator /></TabsContent>
        <TabsContent value="video"><VideoTab /></TabsContent>
        <TabsContent value="repurpose"><RepurposingTab /></TabsContent>
        <TabsContent value="bank"><ContentBank /></TabsContent>
        <TabsContent value="publish"><PublishTab /></TabsContent>
        <TabsContent value="prospects"><InstagramProspecting /></TabsContent>
        <TabsContent value="saved"><SavedProspectsTab /></TabsContent>
        <TabsContent value="connections"><ConnectionsTab /></TabsContent>
        <TabsContent value="analytics"><AnalyticsDashboard /></TabsContent>
      </Tabs>
    </div>
  );
}
