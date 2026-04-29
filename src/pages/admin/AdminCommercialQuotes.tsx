import { useEffect, useMemo, useState, type ComponentType, type Dispatch, type SetStateAction } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Building2,
  CheckCircle2,
  Download,
  Euro,
  FileText,
  Landmark,
  Loader2,
  Percent,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type ERPSettings = Database["public"]["Tables"]["erp_settings"]["Row"];
type ERPSettingsUpdate = Database["public"]["Tables"]["erp_settings"]["Update"];
type CommercialQuote = Database["public"]["Tables"]["commercial_quotes"]["Row"];
type CommercialQuoteInsert = Database["public"]["Tables"]["commercial_quotes"]["Insert"];
type QuoteRequest = Database["public"]["Tables"]["quote_requests"]["Row"];
type QuoteRequestPayload = {
  countryCode?: string;
  countryName?: string;
  vatNumber?: string;
};

type QuoteLineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

type ViesResult = {
  valid: boolean;
  countryCode: string;
  vatNumber: string;
  name?: string;
  address?: string;
  requestDate?: string;
  error?: string;
};

type QuoteForm = {
  source_quote_request_id: string;
  client_name: string;
  client_company: string;
  client_email: string;
  client_phone: string;
  client_vat_number: string;
  client_country_code: string;
  client_country: string;
  client_address: string;
  client_postal_code: string;
  client_city: string;
  is_business: boolean;
  issue_date: string;
  valid_until: string;
  line_items: QuoteLineItem[];
  notes: string;
  vies_valid: boolean | null;
  vies_name: string;
  vies_address: string;
  vies_checked_at: string | null;
};

const EU_COUNTRIES = [
  ["AT", "Austria"],
  ["BE", "Bélgica"],
  ["BG", "Bulgaria"],
  ["CY", "Chipre"],
  ["CZ", "Chequia"],
  ["DE", "Alemania"],
  ["DK", "Dinamarca"],
  ["EE", "Estonia"],
  ["EL", "Grecia"],
  ["ES", "España"],
  ["FI", "Finlandia"],
  ["FR", "Francia"],
  ["HR", "Croacia"],
  ["HU", "Hungría"],
  ["IE", "Irlanda"],
  ["IT", "Italia"],
  ["LT", "Lituania"],
  ["LU", "Luxemburgo"],
  ["LV", "Letonia"],
  ["MT", "Malta"],
  ["NL", "Países Bajos"],
  ["PL", "Polonia"],
  ["PT", "Portugal"],
  ["RO", "Rumanía"],
  ["SE", "Suecia"],
  ["SI", "Eslovenia"],
  ["SK", "Eslovaquia"],
] as const;

const STATUS_META: Record<string, { label: string; className: string }> = {
  draft: { label: "Borrador", className: "bg-muted text-muted-foreground border-border" },
  sent: { label: "Enviado", className: "bg-blue-500/15 text-blue-500 border-blue-500/30" },
  accepted: { label: "Aceptado", className: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" },
  rejected: { label: "Rechazado", className: "bg-destructive/15 text-destructive border-destructive/30" },
  expired: { label: "Caducado", className: "bg-amber-500/15 text-amber-500 border-amber-500/30" },
};

const emptySettings: ERPSettings = {
  id: "default",
  company_name: "Silvio Costa Photography",
  legal_name: "",
  vat_number: "",
  address: "",
  postal_code: "",
  city: "",
  country: "Portugal",
  country_code: "PT",
  email: "silvio@silviocosta.net",
  phone: "+34 640 934 640",
  website: "https://silviocosta.net",
  bank_name: "",
  bank_holder: "",
  iban: "",
  bic: "",
  quote_prefix: "SC",
  next_quote_number: 1,
  default_vat_rate: 23,
  currency: "EUR",
  payment_terms: "Validez del presupuesto: 30 días. Forma de pago según condiciones acordadas.",
  footer_notes: "Presupuesto emitido sin IVA en la base. El IVA aplicable se calcula según país, NIF/CIF/VAT y validación VIES cuando corresponda.",
  created_at: "",
  updated_at: "",
};

const newLineItem = (description = "", unitPrice = 0): QuoteLineItem => ({
  id: crypto.randomUUID(),
  description,
  quantity: 1,
  unitPrice,
});

const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const emptyQuoteForm = (): QuoteForm => ({
  source_quote_request_id: "",
  client_name: "",
  client_company: "",
  client_email: "",
  client_phone: "",
  client_vat_number: "",
  client_country_code: "PT",
  client_country: "Portugal",
  client_address: "",
  client_postal_code: "",
  client_city: "",
  is_business: true,
  issue_date: today(),
  valid_until: plusDays(30),
  line_items: [newLineItem()],
  notes: "",
  vies_valid: null,
  vies_name: "",
  vies_address: "",
  vies_checked_at: null,
});

const money = (value: number, currency = "EUR") =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);

const parseLineItems = (value: unknown): QuoteLineItem[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const row = item as Partial<QuoteLineItem>;
      return {
        id: row.id || crypto.randomUUID(),
        description: row.description || "",
        quantity: Number(row.quantity) || 0,
        unitPrice: Number(row.unitPrice) || 0,
      };
    })
    .filter((item) => item.description);
};

const subtotalFor = (items: QuoteLineItem[]) =>
  items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0);

const countryName = (code: string) =>
  EU_COUNTRIES.find(([countryCode]) => countryCode === code)?.[1] || code;

const isEuCountry = (code: string) => EU_COUNTRIES.some(([countryCode]) => countryCode === code);

const quoteRequestPayload = (request: QuoteRequest): QuoteRequestPayload => {
  const payload = request.request_payload;
  return payload && typeof payload === "object" && !Array.isArray(payload)
    ? payload as QuoteRequestPayload
    : {};
};

const vatDecision = (settings: ERPSettings, form: QuoteForm) => {
  const supplierCountry = settings.country_code || "PT";
  const clientCountry = form.client_country_code || "PT";
  const standardRate = Number(settings.default_vat_rate || 23);

  if (clientCountry === supplierCountry) {
    return { rate: standardRate, rule: "pt_vat", note: null };
  }

  if (isEuCountry(clientCountry) && form.is_business && form.vies_valid === true) {
    return {
      rate: 0,
      rule: "eu_reverse_charge",
      note: "IVA 0% por operación intracomunitaria B2B. Inversión del sujeto pasivo / reverse charge. VAT due by customer.",
    };
  }

  if (isEuCountry(clientCountry)) {
    return {
      rate: standardRate,
      rule: "pt_vat_eu_no_vies",
      note: "Cliente UE sin validación VIES activa: se aplica IVA portugués.",
    };
  }

  return {
    rate: 0,
    rule: "outside_eu_manual_review",
    note: "Cliente fuera de la UE: revisar tratamiento fiscal antes de emitir factura.",
  };
};

const quoteTotals = (settings: ERPSettings, form: QuoteForm) => {
  const subtotal = subtotalFor(form.line_items);
  const decision = vatDecision(settings, form);
  const vatAmount = subtotal * (decision.rate / 100);
  return {
    subtotal,
    vatRate: decision.rate,
    vatAmount,
    total: subtotal + vatAmount,
    rule: decision.rule,
    note: decision.note,
  };
};

const quoteNumber = (settings: ERPSettings) =>
  `${settings.quote_prefix || "SC"}-${new Date().getFullYear()}-${String(settings.next_quote_number || 1).padStart(4, "0")}`;

const AdminCommercialQuotes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState<ERPSettings>(emptySettings);
  const [quoteForm, setQuoteForm] = useState<QuoteForm>(emptyQuoteForm());
  const [validatingVies, setValidatingVies] = useState(false);

  const { data: settings = emptySettings, error: settingsError } = useQuery({
    queryKey: ["erp_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("erp_settings")
        .select("*")
        .eq("id", "default")
        .maybeSingle();
      if (error) throw error;
      return (data || emptySettings) as ERPSettings;
    },
  });

  const { data: quotes = [], isLoading, isFetching, refetch, error: quotesError } = useQuery({
    queryKey: ["commercial_quotes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commercial_quotes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CommercialQuote[];
    },
  });

  const { data: quoteRequests = [] } = useQuery({
    queryKey: ["quote_requests_for_erp"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quote_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as QuoteRequest[];
    },
  });

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  const saveSettings = useMutation({
    mutationFn: async (payload: ERPSettingsUpdate) => {
      const cleanPayload = { ...payload };
      delete cleanPayload.created_at;
      delete cleanPayload.updated_at;
      const { error } = await supabase.from("erp_settings").upsert({ ...cleanPayload, id: "default" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["erp_settings"] });
      toast({ title: "Datos de empresa guardados" });
    },
    onError: () => toast({ title: "No se pudo guardar la configuración", variant: "destructive" }),
  });

  const createQuote = useMutation({
    mutationFn: async (payload: CommercialQuoteInsert) => {
      const { error } = await supabase.from("commercial_quotes").insert(payload);
      if (error) throw error;
      await supabase
        .from("erp_settings")
        .update({ next_quote_number: (settings.next_quote_number || 1) + 1 })
        .eq("id", "default");
    },
    onSuccess: () => {
      setDialogOpen(false);
      setQuoteForm(emptyQuoteForm());
      queryClient.invalidateQueries({ queryKey: ["commercial_quotes"] });
      queryClient.invalidateQueries({ queryKey: ["erp_settings"] });
      toast({ title: "Presupuesto creado" });
    },
    onError: (error) => toast({ title: "No se pudo crear el presupuesto", description: error.message, variant: "destructive" }),
  });

  const updateQuote = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Database["public"]["Tables"]["commercial_quotes"]["Update"] }) => {
      const { error } = await supabase.from("commercial_quotes").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["commercial_quotes"] }),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return quotes.filter((quote) =>
      !q ||
      quote.quote_number.toLowerCase().includes(q) ||
      quote.client_name.toLowerCase().includes(q) ||
      (quote.client_company || "").toLowerCase().includes(q) ||
      (quote.client_email || "").toLowerCase().includes(q) ||
      (quote.client_vat_number || "").toLowerCase().includes(q),
    );
  }, [quotes, search]);

  const selected = useMemo(
    () => quotes.find((quote) => quote.id === selectedId) ?? filtered[0] ?? null,
    [quotes, selectedId, filtered],
  );

  const totals = quoteTotals(settings, quoteForm);
  const quotesErrorMessage = quotesError instanceof Error ? quotesError.message : "";
  const settingsErrorMessage = settingsError instanceof Error ? settingsError.message : "";

  const applyQuoteRequest = (id: string) => {
    const request = quoteRequests.find((item) => item.id === id);
    if (!request) return;
    const payload = quoteRequestPayload(request);
    setQuoteForm((form) => {
      const clientCountryCode = (payload.countryCode || form.client_country_code || "PT").toUpperCase();
      return {
        ...form,
        source_quote_request_id: request.id,
        client_name: request.name || request.email,
        client_email: request.email,
        client_phone: request.phone || "",
        client_vat_number: payload.vatNumber || form.client_vat_number,
        client_country_code: clientCountryCode,
        client_country: payload.countryName || countryName(clientCountryCode),
        line_items: [
          newLineItem(
            `${request.service} · ${request.scope} · ${request.location}`,
            Number(request.min_amount || request.max_amount || 0),
          ),
        ],
        notes: request.summary || request.details || "",
      };
    });
  };

  const validateVies = async () => {
    if (!quoteForm.client_vat_number.trim()) {
      toast({ title: "Introduce un NIF/CIF/VAT intracomunitario", variant: "destructive" });
      return;
    }
    setValidatingVies(true);
    try {
      const { data, error } = await supabase.functions.invoke("validate-vies", {
        body: {
          vatNumber: quoteForm.client_vat_number,
          countryCode: quoteForm.client_country_code,
        },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message || "VIES no disponible");
      const result = data as ViesResult;
      setQuoteForm((form) => ({
        ...form,
        client_vat_number: `${result.countryCode}${result.vatNumber}`,
        client_company: result.name && result.name !== "---" ? result.name : form.client_company,
        vies_valid: result.valid,
        vies_name: result.name || "",
        vies_address: result.address || "",
        vies_checked_at: new Date().toISOString(),
      }));
      toast({
        title: result.valid ? "VIES válido" : "VIES no válido",
        description: result.valid ? result.name || "Cliente registrado para operaciones intracomunitarias" : "Se aplicará IVA portugués salvo revisión manual.",
        variant: result.valid ? "default" : "destructive",
      });
    } catch (error) {
      toast({ title: "No se pudo validar en VIES", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    } finally {
      setValidatingVies(false);
    }
  };

  const handleCreateQuote = () => {
    if (!quoteForm.client_name.trim() || quoteForm.line_items.length === 0) {
      toast({ title: "Cliente y líneas son obligatorios", variant: "destructive" });
      return;
    }

    const cleanItems = quoteForm.line_items.filter((item) => item.description.trim() && item.quantity > 0);
    const cleanForm = { ...quoteForm, line_items: cleanItems };
    const nextTotals = quoteTotals(settings, cleanForm);
    const payload: CommercialQuoteInsert = {
      quote_number: quoteNumber(settings),
      status: "draft",
      source_quote_request_id: cleanForm.source_quote_request_id || null,
      client_name: cleanForm.client_name.trim(),
      client_company: cleanForm.client_company || null,
      client_email: cleanForm.client_email || null,
      client_phone: cleanForm.client_phone || null,
      client_vat_number: cleanForm.client_vat_number || null,
      client_country_code: cleanForm.client_country_code,
      client_country: cleanForm.client_country,
      client_address: cleanForm.client_address || null,
      client_postal_code: cleanForm.client_postal_code || null,
      client_city: cleanForm.client_city || null,
      is_business: cleanForm.is_business,
      vies_valid: cleanForm.vies_valid,
      vies_name: cleanForm.vies_name || null,
      vies_address: cleanForm.vies_address || null,
      vies_checked_at: cleanForm.vies_checked_at,
      vat_rule: nextTotals.rule,
      reverse_charge_note: nextTotals.note,
      issue_date: cleanForm.issue_date,
      valid_until: cleanForm.valid_until || null,
      line_items: cleanItems,
      subtotal: nextTotals.subtotal,
      vat_rate: nextTotals.vatRate,
      vat_amount: nextTotals.vatAmount,
      total: nextTotals.total,
      currency: settings.currency || "EUR",
      notes: cleanForm.notes || null,
      payment_terms: settings.payment_terms,
    };
    createQuote.mutate(payload);
  };

  const printQuote = (quote: CommercialQuote) => {
    const items = parseLineItems(quote.line_items);
    const html = buildPrintableQuote(quote, items, settings);
    const win = window.open("", "_blank", "noopener,noreferrer");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6" /> Presupuestos
          </h1>
          <p className="text-sm text-muted-foreground">
            Mini ERP para presupuestos sin IVA en base, validación VIES, reglas intracomunitarias y datos bancarios.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={cn("h-4 w-4 mr-1", isFetching && "animate-spin")} />
            Actualizar
          </Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Nuevo presupuesto
          </Button>
        </div>
      </div>

      {(quotesErrorMessage || settingsErrorMessage) && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          No se pudo cargar el módulo de presupuestos. Es probable que falte aplicar la migración `commercial_quotes` / `erp_settings`.
        </div>
      )}

      <Tabs defaultValue="quotes">
        <TabsList>
          <TabsTrigger value="quotes">Presupuestos</TabsTrigger>
          <TabsTrigger value="settings">Empresa y banco</TabsTrigger>
        </TabsList>

        <TabsContent value="quotes" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Metric icon={FileText} label="Total presupuestos" value={quotes.length} />
            <Metric icon={Euro} label="Aceptados" value={quotes.filter((quote) => quote.status === "accepted").length} tone="primary" />
            <Metric icon={Percent} label="IVA estándar" value={`${settings.default_vat_rate}%`} />
            <Metric icon={CheckCircle2} label="VIES válidos" value={quotes.filter((quote) => quote.vies_valid).length} tone="primary" />
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por número, cliente, empresa, email o VAT..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>

          <div className="grid min-h-[62vh] gap-4 xl:grid-cols-[minmax(340px,0.9fr)_minmax(0,1.45fr)]">
            <Card className="overflow-hidden">
              <div className="border-b border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                {filtered.length} de {quotes.length} presupuestos
              </div>
              <div className="max-h-[74vh] divide-y divide-border overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando...
                  </div>
                ) : filtered.length === 0 ? (
                  <p className="py-12 text-center text-sm text-muted-foreground">No hay presupuestos.</p>
                ) : (
                  filtered.map((quote) => (
                    <button
                      key={quote.id}
                      onClick={() => setSelectedId(quote.id)}
                      className={cn(
                        "w-full px-3 py-3 text-left transition-colors hover:bg-muted/50",
                        selected?.id === quote.id && "bg-muted",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{quote.quote_number}</p>
                          <p className="truncate text-xs text-muted-foreground">{quote.client_company || quote.client_name}</p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-primary">{money(Number(quote.total), quote.currency)}</p>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", STATUS_META[quote.status]?.className)}>
                          {STATUS_META[quote.status]?.label || quote.status}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(quote.issue_date), "dd MMM yyyy", { locale: es })}
                        </span>
                        {quote.vat_rule === "eu_reverse_charge" && (
                          <span className="ml-auto text-[10px] text-primary">IVA 0% VIES</span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </Card>

            <Card className="overflow-hidden">
              {!selected ? (
                <div className="flex h-full flex-col items-center justify-center p-12 text-muted-foreground">
                  <FileText className="mb-3 h-12 w-12 opacity-40" />
                  <p className="text-sm">Selecciona o crea un presupuesto.</p>
                </div>
              ) : (
                <QuoteDetail
                  quote={selected}
                  settings={settings}
                  onPrint={() => printQuote(selected)}
                  onStatus={(status) => updateQuote.mutate({ id: selected.id, patch: { status } })}
                />
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <SettingsPanel
            settings={settingsForm}
            onChange={setSettingsForm}
            onSave={() => saveSettings.mutate(settingsForm)}
            saving={saveSettings.isPending}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo presupuesto · {quoteNumber(settings)}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <section className="rounded-lg border border-border p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Origen y cliente</h3>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="md:col-span-3">
                  <Label>Crear desde solicitud IA</Label>
                  <Select value={quoteForm.source_quote_request_id || "none"} onValueChange={(value) => value !== "none" ? applyQuoteRequest(value) : setQuoteForm((form) => ({ ...form, source_quote_request_id: "" }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar solicitud IA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin solicitud IA</SelectItem>
                      {quoteRequests.map((request) => (
                        <SelectItem key={request.id} value={request.id}>
                          {request.service} · {request.email} · {money(Number(request.min_amount || request.max_amount || 0))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <FormInput label="Nombre cliente *" value={quoteForm.client_name} onChange={(value) => setQuoteForm((form) => ({ ...form, client_name: value }))} />
                <FormInput label="Empresa" value={quoteForm.client_company} onChange={(value) => setQuoteForm((form) => ({ ...form, client_company: value }))} />
                <FormInput label="Email" value={quoteForm.client_email} onChange={(value) => setQuoteForm((form) => ({ ...form, client_email: value }))} />
                <FormInput label="Teléfono" value={quoteForm.client_phone} onChange={(value) => setQuoteForm((form) => ({ ...form, client_phone: value }))} />
                <div>
                  <Label>País cliente</Label>
                  <Select
                    value={quoteForm.client_country_code}
                    onValueChange={(code) => setQuoteForm((form) => ({
                      ...form,
                      client_country_code: code,
                      client_country: countryName(code),
                      vies_valid: code === "PT" ? null : form.vies_valid,
                    }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EU_COUNTRIES.map(([code, name]) => (
                        <SelectItem key={code} value={code}>{code} · {name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <FormInput label="NIF/CIF/VAT" value={quoteForm.client_vat_number} onChange={(value) => setQuoteForm((form) => ({ ...form, client_vat_number: value, vies_valid: null }))} />
                <FormInput label="Dirección" value={quoteForm.client_address} onChange={(value) => setQuoteForm((form) => ({ ...form, client_address: value }))} />
                <FormInput label="Ciudad" value={quoteForm.client_city} onChange={(value) => setQuoteForm((form) => ({ ...form, client_city: value }))} />
                <FormInput label="Código postal" value={quoteForm.client_postal_code} onChange={(value) => setQuoteForm((form) => ({ ...form, client_postal_code: value }))} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
                <Button type="button" variant="outline" size="sm" onClick={validateVies} disabled={validatingVies || quoteForm.client_country_code === "PT"}>
                  {validatingVies ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1 h-4 w-4" />}
                  Validar VIES
                </Button>
                {quoteForm.client_country_code === "PT" && <span className="text-xs text-muted-foreground">Cliente Portugal: se aplica IVA portugués.</span>}
                {quoteForm.vies_valid === true && <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30">VIES válido · IVA 0%</Badge>}
                {quoteForm.vies_valid === false && <Badge variant="outline" className="bg-destructive/15 text-destructive border-destructive/30">VIES no válido · IVA 23%</Badge>}
              </div>
            </section>

            <section className="rounded-lg border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Líneas del presupuesto</h3>
                <Button variant="outline" size="sm" onClick={() => setQuoteForm((form) => ({ ...form, line_items: [...form.line_items, newLineItem()] }))}>
                  <Plus className="mr-1 h-4 w-4" /> Línea
                </Button>
              </div>
              <div className="space-y-2">
                {quoteForm.line_items.map((item, index) => (
                  <div key={item.id} className="grid gap-2 md:grid-cols-[1fr_100px_140px_40px]">
                    <Input
                      value={item.description}
                      placeholder="Descripción del servicio"
                      onChange={(event) => updateLine(index, { description: event.target.value }, setQuoteForm)}
                    />
                    <Input
                      type="number"
                      value={item.quantity}
                      min="0"
                      step="0.01"
                      onChange={(event) => updateLine(index, { quantity: Number(event.target.value) }, setQuoteForm)}
                    />
                    <Input
                      type="number"
                      value={item.unitPrice}
                      min="0"
                      step="0.01"
                      onChange={(event) => updateLine(index, { unitPrice: Number(event.target.value) }, setQuoteForm)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => setQuoteForm((form) => ({ ...form, line_items: form.line_items.filter((_, i) => i !== index) }))}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-2 rounded-lg bg-muted/30 p-3 text-sm md:grid-cols-4">
                <Summary label="Base sin IVA" value={money(totals.subtotal, settings.currency)} />
                <Summary label="IVA" value={`${totals.vatRate}%`} />
                <Summary label="Importe IVA" value={money(totals.vatAmount, settings.currency)} />
                <Summary label="Total" value={money(totals.total, settings.currency)} strong />
              </div>
              {totals.note && <p className="mt-2 text-xs text-muted-foreground">{totals.note}</p>}
            </section>

            <section className="grid gap-3 md:grid-cols-3">
              <FormInput label="Fecha emisión" type="date" value={quoteForm.issue_date} onChange={(value) => setQuoteForm((form) => ({ ...form, issue_date: value }))} />
              <FormInput label="Válido hasta" type="date" value={quoteForm.valid_until} onChange={(value) => setQuoteForm((form) => ({ ...form, valid_until: value }))} />
              <div className="md:col-span-3">
                <Label>Notas</Label>
                <Textarea value={quoteForm.notes} onChange={(event) => setQuoteForm((form) => ({ ...form, notes: event.target.value }))} rows={3} className="mt-1" />
              </div>
            </section>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateQuote} disabled={createQuote.isPending}>
              {createQuote.isPending ? "Creando..." : "Crear presupuesto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const updateLine = (
  index: number,
  patch: Partial<QuoteLineItem>,
  setQuoteForm: Dispatch<SetStateAction<QuoteForm>>,
) => {
  setQuoteForm((form) => ({
    ...form,
    line_items: form.line_items.map((item, i) => i === index ? { ...item, ...patch } : item),
  }));
};

const Metric = ({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  tone?: "primary";
}) => (
  <Card>
    <CardContent className="flex items-center justify-between py-4">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
      <Icon className={cn("h-5 w-5 text-muted-foreground", tone === "primary" && "text-primary")} />
    </CardContent>
  </Card>
);

const Summary = ({ label, value, strong }: { label: string; value: string; strong?: boolean }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className={cn("font-semibold text-foreground", strong && "text-lg text-primary")}>{value}</p>
  </div>
);

const FormInput = ({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) => (
  <div>
    <Label>{label}</Label>
    <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1" />
  </div>
);

const SettingsPanel = ({
  settings,
  onChange,
  onSave,
  saving,
}: {
  settings: ERPSettings;
  onChange: Dispatch<SetStateAction<ERPSettings>>;
  onSave: () => void;
  saving: boolean;
}) => (
  <div className="grid gap-4 lg:grid-cols-2">
    <Card>
      <CardContent className="space-y-4 py-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <Building2 className="h-5 w-5" /> Datos de empresa
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <SettingsInput label="Nombre comercial" value={settings.company_name} onChange={(value) => onChange((s) => ({ ...s, company_name: value }))} />
          <SettingsInput label="Razón social" value={settings.legal_name || ""} onChange={(value) => onChange((s) => ({ ...s, legal_name: value }))} />
          <SettingsInput label="NIF/VAT empresa" value={settings.vat_number || ""} onChange={(value) => onChange((s) => ({ ...s, vat_number: value }))} />
          <SettingsInput label="Email" value={settings.email || ""} onChange={(value) => onChange((s) => ({ ...s, email: value }))} />
          <SettingsInput label="Teléfono" value={settings.phone || ""} onChange={(value) => onChange((s) => ({ ...s, phone: value }))} />
          <SettingsInput label="Web" value={settings.website || ""} onChange={(value) => onChange((s) => ({ ...s, website: value }))} />
          <SettingsInput label="Dirección" value={settings.address || ""} onChange={(value) => onChange((s) => ({ ...s, address: value }))} />
          <SettingsInput label="Ciudad" value={settings.city || ""} onChange={(value) => onChange((s) => ({ ...s, city: value }))} />
          <SettingsInput label="Código postal" value={settings.postal_code || ""} onChange={(value) => onChange((s) => ({ ...s, postal_code: value }))} />
          <SettingsInput label="País" value={settings.country} onChange={(value) => onChange((s) => ({ ...s, country: value }))} />
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent className="space-y-4 py-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <Landmark className="h-5 w-5" /> Banco y reglas
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <SettingsInput label="Banco" value={settings.bank_name || ""} onChange={(value) => onChange((s) => ({ ...s, bank_name: value }))} />
          <SettingsInput label="Titular" value={settings.bank_holder || ""} onChange={(value) => onChange((s) => ({ ...s, bank_holder: value }))} />
          <SettingsInput label="IBAN" value={settings.iban || ""} onChange={(value) => onChange((s) => ({ ...s, iban: value }))} />
          <SettingsInput label="BIC/SWIFT" value={settings.bic || ""} onChange={(value) => onChange((s) => ({ ...s, bic: value }))} />
          <SettingsInput label="Prefijo presupuesto" value={settings.quote_prefix} onChange={(value) => onChange((s) => ({ ...s, quote_prefix: value }))} />
          <SettingsInput label="Siguiente número" type="number" value={String(settings.next_quote_number)} onChange={(value) => onChange((s) => ({ ...s, next_quote_number: Number(value) || 1 }))} />
          <SettingsInput label="IVA estándar Portugal (%)" type="number" value={String(settings.default_vat_rate)} onChange={(value) => onChange((s) => ({ ...s, default_vat_rate: Number(value) || 23 }))} />
          <SettingsInput label="Moneda" value={settings.currency} onChange={(value) => onChange((s) => ({ ...s, currency: value }))} />
        </div>
        <div>
          <Label>Condiciones de pago</Label>
          <Textarea value={settings.payment_terms || ""} onChange={(event) => onChange((s) => ({ ...s, payment_terms: event.target.value }))} rows={3} className="mt-1" />
        </div>
        <div>
          <Label>Notas legales / pie</Label>
          <Textarea value={settings.footer_notes || ""} onChange={(event) => onChange((s) => ({ ...s, footer_notes: event.target.value }))} rows={3} className="mt-1" />
        </div>
        <Button onClick={onSave} disabled={saving}>{saving ? "Guardando..." : "Guardar configuración"}</Button>
      </CardContent>
    </Card>
  </div>
);

const SettingsInput = ({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) => (
  <div>
    <Label>{label}</Label>
    <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1" />
  </div>
);

const QuoteDetail = ({
  quote,
  settings,
  onPrint,
  onStatus,
}: {
  quote: CommercialQuote;
  settings: ERPSettings;
  onPrint: () => void;
  onStatus: (status: string) => void;
}) => {
  const items = parseLineItems(quote.line_items);
  return (
    <div className="flex max-h-[78vh] flex-col">
      <div className="border-b border-border p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">{quote.quote_number}</h2>
            <p className="text-sm text-muted-foreground">{quote.client_company || quote.client_name}</p>
          </div>
          <div className="flex gap-2">
            <Select value={quote.status} onValueChange={onStatus}>
              <SelectTrigger className="h-9 w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_META).map(([value, meta]) => (
                  <SelectItem key={value} value={value}>{meta.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={onPrint}>
              <Download className="mr-1 h-4 w-4" /> PDF/Imprimir
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <section className="grid gap-3 md:grid-cols-2">
          <Info label="Cliente" value={quote.client_name} />
          <Info label="Empresa" value={quote.client_company || "No indicada"} />
          <Info label="Email" value={quote.client_email || "No indicado"} />
          <Info label="VAT/NIF" value={quote.client_vat_number || "No indicado"} />
          <Info label="País" value={`${quote.client_country_code} · ${quote.client_country}`} />
          <Info label="VIES" value={quote.vies_valid === true ? "Válido" : quote.vies_valid === false ? "No válido" : "No validado"} />
        </section>

        <section className="rounded-lg border border-border overflow-hidden">
          <div className="grid grid-cols-[1fr_80px_120px_120px] bg-muted/50 px-3 py-2 text-xs font-semibold text-muted-foreground">
            <span>Concepto</span>
            <span>Cant.</span>
            <span>Precio</span>
            <span>Total</span>
          </div>
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_80px_120px_120px] border-t border-border px-3 py-2 text-sm">
              <span>{item.description}</span>
              <span>{item.quantity}</span>
              <span>{money(item.unitPrice, quote.currency)}</span>
              <span>{money(item.quantity * item.unitPrice, quote.currency)}</span>
            </div>
          ))}
        </section>

        <section className="grid gap-2 rounded-lg bg-muted/30 p-4 md:grid-cols-4">
          <Summary label="Base sin IVA" value={money(Number(quote.subtotal), quote.currency)} />
          <Summary label="IVA" value={`${quote.vat_rate}%`} />
          <Summary label="Importe IVA" value={money(Number(quote.vat_amount), quote.currency)} />
          <Summary label="Total" value={money(Number(quote.total), quote.currency)} strong />
        </section>

        {quote.reverse_charge_note && (
          <p className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">
            {quote.reverse_charge_note}
          </p>
        )}

        <section className="grid gap-3 md:grid-cols-2">
          <Info label="Emisión" value={format(new Date(quote.issue_date), "dd MMM yyyy", { locale: es })} />
          <Info label="Válido hasta" value={quote.valid_until ? format(new Date(quote.valid_until), "dd MMM yyyy", { locale: es }) : "No indicado"} />
          <Info label="Banco" value={settings.bank_name || "No indicado"} />
          <Info label="IBAN" value={settings.iban || "No indicado"} />
        </section>

        {quote.notes && <Info label="Notas" value={quote.notes} />}
        {quote.payment_terms && <Info label="Condiciones" value={quote.payment_terms} />}
      </div>
    </div>
  );
};

const Info = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-border bg-muted/30 p-3">
    <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="break-words text-sm text-foreground whitespace-pre-wrap">{value}</p>
  </div>
);

const buildPrintableQuote = (quote: CommercialQuote, items: QuoteLineItem[], settings: ERPSettings) => `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${quote.quote_number}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111827; margin: 40px; }
    h1, h2, h3 { margin: 0; }
    .top { display: flex; justify-content: space-between; gap: 32px; border-bottom: 2px solid #111827; padding-bottom: 24px; }
    .muted { color: #6b7280; font-size: 12px; }
    .box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-top: 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    th, td { border-bottom: 1px solid #e5e7eb; padding: 10px; text-align: left; }
    th { background: #f9fafb; font-size: 12px; color: #6b7280; text-transform: uppercase; }
    .right { text-align: right; }
    .totals { margin-left: auto; width: 320px; margin-top: 24px; }
    .totals div { display: flex; justify-content: space-between; padding: 6px 0; }
    .total { font-size: 20px; font-weight: bold; border-top: 2px solid #111827; margin-top: 8px; padding-top: 10px !important; }
    .note { background: #f9fafb; border-radius: 8px; padding: 12px; margin-top: 20px; font-size: 12px; color: #374151; }
  </style>
</head>
<body>
  <div class="top">
    <div>
      <h1>Presupuesto ${quote.quote_number}</h1>
      <p class="muted">Fecha: ${quote.issue_date}${quote.valid_until ? ` · Válido hasta: ${quote.valid_until}` : ""}</p>
    </div>
    <div class="right">
      <h2>${settings.company_name}</h2>
      <p class="muted">${settings.legal_name || ""}<br>${settings.vat_number || ""}<br>${settings.address || ""} ${settings.postal_code || ""} ${settings.city || ""}<br>${settings.country || ""}<br>${settings.email || ""} ${settings.phone || ""}</p>
    </div>
  </div>

  <div class="box">
    <h3>Cliente</h3>
    <p>${quote.client_company || quote.client_name}<br>${quote.client_name}<br>${quote.client_vat_number || ""}<br>${quote.client_address || ""} ${quote.client_postal_code || ""} ${quote.client_city || ""}<br>${quote.client_country}</p>
  </div>

  <table>
    <thead><tr><th>Concepto</th><th class="right">Cantidad</th><th class="right">Precio sin IVA</th><th class="right">Total</th></tr></thead>
    <tbody>
      ${items.map((item) => `<tr><td>${item.description}</td><td class="right">${item.quantity}</td><td class="right">${money(item.unitPrice, quote.currency)}</td><td class="right">${money(item.quantity * item.unitPrice, quote.currency)}</td></tr>`).join("")}
    </tbody>
  </table>

  <div class="totals">
    <div><span>Base imponible</span><strong>${money(Number(quote.subtotal), quote.currency)}</strong></div>
    <div><span>IVA ${quote.vat_rate}%</span><strong>${money(Number(quote.vat_amount), quote.currency)}</strong></div>
    <div class="total"><span>Total</span><span>${money(Number(quote.total), quote.currency)}</span></div>
  </div>

  ${quote.reverse_charge_note ? `<div class="note">${quote.reverse_charge_note}</div>` : ""}
  ${quote.notes ? `<div class="note">${quote.notes}</div>` : ""}
  <div class="box">
    <h3>Datos bancarios</h3>
    <p>Banco: ${settings.bank_name || ""}<br>Titular: ${settings.bank_holder || settings.company_name}<br>IBAN: ${settings.iban || ""}<br>BIC/SWIFT: ${settings.bic || ""}</p>
  </div>
  <p class="muted">${quote.payment_terms || settings.payment_terms || ""}</p>
  <p class="muted">${settings.footer_notes || ""}</p>
</body>
</html>`;

export default AdminCommercialQuotes;
