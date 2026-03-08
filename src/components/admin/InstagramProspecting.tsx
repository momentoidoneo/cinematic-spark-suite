import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search, Instagram, Loader2, Copy, Sparkles, MessageCircle,
  RefreshCw, MapPin, Users, Heart, Target, ChevronDown, Save, Trash2, BookmarkCheck, Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  username: string;
  profileUrl: string;
  content: string;
  title: string;
  description: string;
}

interface ProfileAnalysis {
  followers_estimate: string;
  engagement_quality: string;
  brand_affinity: number;
  interests: string[];
  location_detected: string;
  account_quality: string;
  summary: string;
}

interface SavedProspect {
  id: string;
  username: string;
  profile_url: string | null;
  profile_title: string | null;
  profile_description: string | null;
  analysis: ProfileAnalysis | null;
  generated_dms: string | null;
  brand_context: string | null;
  message_style: string | null;
  created_at: string;
}

export function InstagramProspecting() {
  const [username, setUsername] = useState("");
  const [brandContext, setBrandContext] = useState("");
  const [messageStyle, setMessageStyle] = useState("cercano y profesional");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileAnalysis, setProfileAnalysis] = useState<ProfileAnalysis | null>(null);
  const [generatedDMs, setGeneratedDMs] = useState<string | null>(null);
  const [loadingScrape, setLoadingScrape] = useState(false);
  const [loadingDM, setLoadingDM] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [interests, setInterests] = useState("");
  const [location, setLocation] = useState("");
  const [followerRange, setFollowerRange] = useState("any");
  const [searchResults, setSearchResults] = useState<Array<{ username: string; description: string; url: string }>>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [savedProspects, setSavedProspects] = useState<SavedProspect[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [expandedSaved, setExpandedSaved] = useState<string | null>(null);

  const [discardedUsernames, setDiscardedUsernames] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("discarded_prospects") || "[]"); } catch { return []; }
  });

  useEffect(() => { loadSavedProspects(); }, []);

  const loadSavedProspects = async () => {
    setLoadingSaved(true);
    try {
      const { data, error } = await supabase.from("saved_prospects").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setSavedProspects((data || []) as unknown as SavedProspect[]);
    } catch {} finally { setLoadingSaved(false); }
  };

  const handleSmartSearch = async () => {
    if (!searchQuery.trim() && !interests.trim() && !location.trim() && followerRange === "any") return toast.error("Introduce al menos un criterio");
    setLoadingSearch(true); setSearchResults([]);
    try {
      const excludeUsernames = [...savedProspects.map(p => p.username), ...discardedUsernames];
      const { data, error } = await supabase.functions.invoke("prospect-instagram", { body: { action: "smart_search", searchQuery: searchQuery.trim(), interests: interests.trim(), location: location.trim(), followerRange, excludeUsernames } });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      const filtered = (data.results || []).filter((r: any) => !excludeUsernames.some(u => u.toLowerCase() === (r.username || "").toLowerCase()));
      setSearchResults(filtered);
      filtered.length === 0 ? toast.info("No se encontraron perfiles nuevos") : toast.success(`${filtered.length} perfiles encontrados`);
    } catch (e: any) { toast.error(e.message || "Error en búsqueda"); } finally { setLoadingSearch(false); }
  };

  const handleScrape = async (user?: string) => {
    const target = user || username.trim();
    if (!target) return toast.error("Introduce un nombre de usuario");
    setUsername(target); setLoadingScrape(true); setProfileData(null); setProfileAnalysis(null); setGeneratedDMs(null);
    try {
      const { data, error } = await supabase.functions.invoke("prospect-instagram", { body: { action: "scrape", username: target } });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setProfileData(data);
      toast.success(`Perfil @${data.username} extraído`);
      if (data.content) {
        setLoadingAnalysis(true);
        try {
          const { data: ad, error: ae } = await supabase.functions.invoke("prospect-instagram", { body: { action: "analyze_profile", profileData: data } });
          if (!ae && !ad.error) setProfileAnalysis(ad.analysis);
        } catch {} finally { setLoadingAnalysis(false); }
      }
    } catch (e: any) { toast.error(e.message || "Error"); } finally { setLoadingScrape(false); }
  };

  const handleGenerateDMs = async () => {
    if (!profileData) return;
    setLoadingDM(true); setGeneratedDMs(null);
    try {
      const { data, error } = await supabase.functions.invoke("prospect-instagram", { body: { action: "generate_dm", profileData, profileAnalysis, brandContext, messageStyle } });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setGeneratedDMs(data.dms);
      toast.success("DMs generados");
    } catch (e: any) { toast.error(e.message || "Error"); } finally { setLoadingDM(false); }
  };

  const handleSaveProspect = async () => {
    if (!profileData || !generatedDMs) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase.from("saved_prospects").insert({ username: profileData.username, profile_url: profileData.profileUrl, profile_title: profileData.title, profile_description: profileData.description, analysis: profileAnalysis as any, generated_dms: generatedDMs, brand_context: brandContext || null, message_style: messageStyle, created_by: (await supabase.auth.getUser()).data.user?.id } as any);
      if (error) throw error;
      toast.success(`@${profileData.username} guardado`);
      await loadSavedProspects();
    } catch (e: any) { toast.error(e.message || "Error"); } finally { setSavingProfile(false); }
  };

  const handleDeleteProspect = async (id: string, un: string) => {
    try { const { error } = await supabase.from("saved_prospects").delete().eq("id", id); if (error) throw error; setSavedProspects(prev => prev.filter(p => p.id !== id)); toast.success(`@${un} eliminado`); } catch (e: any) { toast.error(e.message); }
  };

  const handleDiscardUsername = (u: string) => {
    const n = u.toLowerCase().replace("@", "");
    const updated = [...discardedUsernames, n];
    setDiscardedUsernames(updated);
    localStorage.setItem("discarded_prospects", JSON.stringify(updated));
    setSearchResults(prev => prev.filter(r => r.username.toLowerCase() !== n));
    toast.success(`@${n} descartado`);
  };

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copiado"); };
  const affinityColor = (s: number) => s >= 80 ? "text-green-500" : s >= 50 ? "text-yellow-500" : "text-red-400";
  const isAlreadySaved = profileData ? savedProspects.some(p => p.username.toLowerCase() === profileData.username.toLowerCase()) : false;

  return (
    <div className="space-y-4">
      {/* Saved Prospects */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><BookmarkCheck className="w-4 h-4 text-primary" />Perfiles Guardados ({savedProspects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSaved ? <div className="flex items-center justify-center py-6 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin mr-2" /><span className="text-sm">Cargando...</span></div> : savedProspects.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No hay perfiles guardados aún.</p>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2 pr-2">
                {savedProspects.map((prospect) => {
                  const analysis = prospect.analysis as ProfileAnalysis | null;
                  const isExpanded = expandedSaved === prospect.id;
                  return (
                    <div key={prospect.id} className="border border-border rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer" onClick={() => setExpandedSaved(isExpanded ? null : prospect.id)}>
                        <div className="flex items-center gap-2 min-w-0">
                          <Instagram className="w-4 h-4 text-pink-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium">@{prospect.username}</p>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              {analysis && <><span>{analysis.followers_estimate}</span><span>•</span><span className={affinityColor(analysis.brand_affinity)}>{analysis.brand_affinity}% afinidad</span></>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteProspect(prospect.id, prospect.username); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </div>
                      </div>
                      {isExpanded && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="border-t border-border p-3 space-y-3 bg-muted/20">
                          {prospect.generated_dms && (
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-medium flex items-center gap-1"><MessageCircle className="w-3 h-3" />DMs Generados</p>
                                <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => copyToClipboard(prospect.generated_dms!)}><Copy className="w-3 h-3 mr-1" />Copiar</Button>
                              </div>
                              <div className="text-xs whitespace-pre-wrap bg-background rounded-lg p-3 border border-border max-h-[300px] overflow-auto">{prospect.generated_dms}</div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Smart Search */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Search className="w-4 h-4 text-primary" />Búsqueda Inteligente</CardTitle><CardDescription className="text-xs">Busca perfiles de Instagram por nicho, ubicación y rango de seguidores</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Búsqueda</Label><Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="fotógrafo, inmobiliaria..." /></div>
            <div><Label>Intereses/Nicho</Label><Input value={interests} onChange={e => setInterests(e.target.value)} placeholder="fotografía, arquitectura..." /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Ubicación</Label><Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Madrid, España..." /></div>
            <div><Label>Seguidores</Label>
              <Select value={followerRange} onValueChange={setFollowerRange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Cualquiera</SelectItem>
                  <SelectItem value="nano">1K-10K</SelectItem>
                  <SelectItem value="micro">10K-50K</SelectItem>
                  <SelectItem value="mid">50K-200K</SelectItem>
                  <SelectItem value="macro">200K-1M</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleSmartSearch} disabled={loadingSearch} className="w-full">
            {loadingSearch ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Buscando...</> : <><Search className="w-4 h-4 mr-1.5" />Buscar perfiles</>}
          </Button>
          {searchResults.length > 0 && (
            <ScrollArea className="h-[250px]">
              <div className="space-y-2 pr-2">
                {searchResults.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-muted/50">
                    <div className="flex items-center gap-2 min-w-0">
                      <Instagram className="w-4 h-4 text-pink-500 shrink-0" />
                      <div className="min-w-0"><p className="text-sm font-medium">@{r.username}</p><p className="text-[10px] text-muted-foreground truncate">{r.description}</p></div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleScrape(r.username)}><Eye className="w-3 h-3 mr-1" />Analizar</Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDiscardUsername(r.username)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Manual Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Target className="w-4 h-4 text-primary" />Análisis de Perfil</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2"><Input value={username} onChange={e => setUsername(e.target.value)} placeholder="@username" className="flex-1" /><Button onClick={() => handleScrape()} disabled={loadingScrape}>{loadingScrape ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analizar"}</Button></div>
            {profileData && (
              <Card className="bg-muted/50">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center gap-2"><Instagram className="w-4 h-4 text-pink-500" /><span className="font-medium text-sm">@{profileData.username}</span></div>
                  <p className="text-xs text-muted-foreground">{profileData.description}</p>
                  {loadingAnalysis && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" />Analizando perfil...</div>}
                  {profileAnalysis && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="border border-border rounded p-2 bg-background"><p className="text-[10px] text-muted-foreground">Seguidores</p><p className="text-sm font-semibold">{profileAnalysis.followers_estimate}</p></div>
                      <div className="border border-border rounded p-2 bg-background"><p className="text-[10px] text-muted-foreground">Afinidad</p><p className={`text-sm font-bold ${affinityColor(profileAnalysis.brand_affinity)}`}>{profileAnalysis.brand_affinity}%</p></div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><MessageCircle className="w-4 h-4 text-primary" />Generar DMs</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Contexto de marca</Label><Textarea value={brandContext} onChange={e => setBrandContext(e.target.value)} rows={2} placeholder="Ej: Buscamos fotógrafo inmobiliario para colaboración..." /></div>
            <div><Label>Estilo del mensaje</Label><Input value={messageStyle} onChange={e => setMessageStyle(e.target.value)} placeholder="cercano y profesional" /></div>
            <Button onClick={handleGenerateDMs} disabled={loadingDM || !profileData} className="w-full">
              {loadingDM ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Generando...</> : <><Sparkles className="w-4 h-4 mr-1.5" />Generar DMs personalizados</>}
            </Button>
            {generatedDMs && (
              <div className="space-y-2">
                <div className="flex justify-between"><Label className="text-xs">Resultado</Label><div className="flex gap-1">
                  <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => copyToClipboard(generatedDMs)}><Copy className="w-3 h-3 mr-1" />Copiar</Button>
                  {!isAlreadySaved && <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={handleSaveProspect} disabled={savingProfile}><Save className="w-3 h-3 mr-1" />Guardar</Button>}
                </div></div>
                <ScrollArea className="h-[250px]"><div className="text-xs whitespace-pre-wrap bg-muted/50 rounded-lg p-3 border border-border">{generatedDMs}</div></ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
