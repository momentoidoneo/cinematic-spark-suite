import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Send, Rss, Map as MapIcon, AlertTriangle, Search, Sparkles } from "lucide-react";

interface PingRow {
  id: string;
  url: string;
  engine: string;
  status: string;
  http_status: number | null;
  created_at: string;
}

interface SEOMetadataAuditRow {
  page_path: string;
  title: string | null;
  description: string | null;
}

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

const SITE_URL = "https://silviocosta.net";
const SITEMAPS = [
  { label: "Sitemap Index", path: "/sitemap-index.xml", fn: "sitemap-index" },
  { label: "Sitemap Pages", path: "/sitemap-pages.xml", fn: "sitemap-pages" },
  { label: "Sitemap Blog", path: "/sitemap-blog.xml", fn: "sitemap-blog" },
  { label: "Sitemap Cities", path: "/sitemap-cities.xml", fn: "sitemap-cities" },
  { label: "Sitemap Portfolio", path: "/sitemap-portfolio.xml", fn: "sitemap-portfolio" },
  { label: "Sitemap Images", path: "/sitemap-images.xml", fn: "sitemap-images" },
  { label: "RSS Feed", path: "/rss.xml", fn: "rss-feed" },
];

const AI_DISCOVERY_RESOURCES = [
  { label: "LLMs resumen", url: `${SITE_URL}/llms.txt` },
  { label: "LLMs contexto completo", url: `${SITE_URL}/llms-full.txt` },
  { label: "Guía textual para IA", url: `${SITE_URL}/ai-context/servicios-audiovisuales.md` },
  { label: "Manifest IA", url: `${SITE_URL}/ai-sitemap.json` },
  { label: "Guía de servicios audiovisuales", url: `${SITE_URL}/guia-servicios-audiovisuales` },
];

export default function AdminSEOTechnical() {
  const [urls, setUrls] = useState("");
  const [sending, setSending] = useState(false);
  const [pings, setPings] = useState<PingRow[]>([]);
  const [duplicates, setDuplicates] = useState<{ field: string; value: string; pages: string[] }[]>([]);

  useEffect(() => {
    loadPings();
    loadDuplicates();
  }, []);

  async function loadPings() {
    const { data } = await supabase
      .from("indexnow_pings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setPings(data || []);
  }

  async function loadDuplicates() {
    const { data: meta } = await supabase.from("seo_metadata").select("page_path, title, description");
    if (!meta) return;
    const byTitle: Record<string, string[]> = {};
    const byDesc: Record<string, string[]> = {};
    (meta as SEOMetadataAuditRow[]).forEach((m) => {
      if (m.title) {
        byTitle[m.title] = byTitle[m.title] || [];
        byTitle[m.title].push(m.page_path);
      }
      if (m.description) {
        byDesc[m.description] = byDesc[m.description] || [];
        byDesc[m.description].push(m.page_path);
      }
    });
    const dupes: { field: string; value: string; pages: string[] }[] = [];
    Object.entries(byTitle).forEach(([value, pages]) => { if (pages.length > 1) dupes.push({ field: "title", value, pages }); });
    Object.entries(byDesc).forEach(([value, pages]) => { if (pages.length > 1) dupes.push({ field: "description", value, pages }); });
    setDuplicates(dupes);
  }

  async function notifySearchEngines() {
    const list = urls.split("\n").map(u => u.trim()).filter(Boolean);
    if (list.length === 0) {
      toast.error("Añade al menos una URL");
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("indexnow", {
        body: { urls: list, triggered_by: "admin-manual" },
      });
      if (error) throw error;
      toast.success(`Notificadas ${list.length} URLs a buscadores`);
      setUrls("");
      loadPings();
    } catch (e: unknown) {
      toast.error(errorMessage(e, "Error al notificar"));
    } finally {
      setSending(false);
    }
  }

  async function notifyAllSitemaps() {
    setSending(true);
    try {
      await supabase.functions.invoke("indexnow", {
        body: {
          urls: [
            ...SITEMAPS.map(s => `${SITE_URL}${s.path}`),
            ...AI_DISCOVERY_RESOURCES.map(r => r.url),
          ],
          triggered_by: "admin-sitemaps-ai-discovery",
        },
      });
      toast.success("Sitemaps y recursos IA notificados a buscadores");
      loadPings();
    } catch (e: unknown) {
      toast.error(errorMessage(e, "Error al notificar"));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">SEO Técnico</h1>
        <p className="text-muted-foreground">Indexación, sitemaps, RSS, recursos para IA y auditoría de duplicados.</p>
      </div>

      <Tabs defaultValue="indexnow">
        <TabsList>
          <TabsTrigger value="indexnow"><Send className="h-4 w-4 mr-1" /> IndexNow</TabsTrigger>
          <TabsTrigger value="sitemaps"><MapIcon className="h-4 w-4 mr-1" /> Sitemaps & RSS</TabsTrigger>
          <TabsTrigger value="duplicates"><AlertTriangle className="h-4 w-4 mr-1" /> Duplicados</TabsTrigger>
          <TabsTrigger value="logs"><Search className="h-4 w-4 mr-1" /> Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="indexnow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notificar URLs a buscadores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Una URL por línea (rutas relativas o absolutas). Bing y Yandex la indexarán en horas.
              </p>
              <Textarea
                value={urls}
                onChange={e => setUrls(e.target.value)}
                placeholder={`/blog/mi-nuevo-post\n/fotografia-madrid\nhttps://silviocosta.net/precios`}
                rows={6}
              />
              <div className="flex gap-2">
                <Button onClick={notifySearchEngines} disabled={sending}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  Notificar a Bing/Yandex/Google
                </Button>
                <Button variant="outline" onClick={notifyAllSitemaps} disabled={sending}>
                  Notificar sitemaps + IA
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sitemaps" className="space-y-3">
          {SITEMAPS.map(s => {
            const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${s.fn}`;
            return (
              <Card key={s.path}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{s.label}</div>
                    <a href={fnUrl} target="_blank" rel="noopener" className="text-xs text-primary hover:underline break-all">{fnUrl}</a>
                    <div className="text-xs text-muted-foreground mt-1">Pública (vía proxy o redirect): <code>{SITE_URL}{s.path}</code></div>
                  </div>
                  <a href={fnUrl} target="_blank" rel="noopener">
                    <Button variant="outline" size="sm"><Rss className="h-4 w-4 mr-1" /> Ver</Button>
                  </a>
                </CardContent>
              </Card>
            );
          })}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Recursos para motores de respuesta e IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {AI_DISCOVERY_RESOURCES.map(resource => (
                <div key={resource.url} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
                  <div>
                    <div className="font-medium text-sm">{resource.label}</div>
                    <a href={resource.url} target="_blank" rel="noopener" className="text-xs text-primary hover:underline break-all">
                      {resource.url}
                    </a>
                  </div>
                  <a href={resource.url} target="_blank" rel="noopener">
                    <Button variant="outline" size="sm">Ver</Button>
                  </a>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">
              <strong>Configuración DNS / proxy:</strong> redirige <code>{SITE_URL}/sitemap-*.xml</code> y <code>/rss.xml</code> a las edge functions correspondientes (Cloudflare Worker o reverse-proxy). Mientras tanto, los sitemaps se sirven directamente desde la URL de la edge function de arriba.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="duplicates" className="space-y-3">
          {duplicates.length === 0 ? (
            <Card><CardContent className="p-6 text-center text-muted-foreground">Sin duplicados detectados ✓</CardContent></Card>
          ) : duplicates.map((d, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="text-xs uppercase text-primary font-semibold">{d.field} duplicado</div>
                <div className="font-medium my-1">"{d.value}"</div>
                <div className="text-xs text-muted-foreground">En páginas: {d.pages.join(", ")}</div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="logs" className="space-y-2">
          {pings.map(p => (
            <Card key={p.id}>
              <CardContent className="p-3 flex items-center justify-between text-sm">
                <div className="truncate flex-1 mr-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs mr-2 ${p.status === "ok" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
                    {p.engine} {p.http_status || ""}
                  </span>
                  <span className="text-muted-foreground">{p.url}</span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(p.created_at).toLocaleString("es-ES")}</span>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
