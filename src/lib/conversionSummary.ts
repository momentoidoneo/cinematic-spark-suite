import { supabase } from "@/integrations/supabase/client";

export interface ConversionSummary {
  available: boolean;
  total: number;
  ctaClicks: number;
  whatsappClicks: number;
  formLeads: number;
  quoteCompletions: number;
  quoteWhatsappClicks: number;
  byName: Record<string, number>;
  topPages: { page: string; count: number }[];
}

export const emptyConversionSummary: ConversionSummary = {
  available: false,
  total: 0,
  ctaClicks: 0,
  whatsappClicks: 0,
  formLeads: 0,
  quoteCompletions: 0,
  quoteWhatsappClicks: 0,
  byName: {},
  topPages: [],
};

export const fetchConversionSummary = async (since?: string): Promise<ConversionSummary> => {
  try {
    const { data, error } = await supabase.functions.invoke<ConversionSummary>("conversion-summary", {
      body: { since },
    });

    if (error || !data) return emptyConversionSummary;
    return { ...emptyConversionSummary, ...data, available: true };
  } catch {
    return emptyConversionSummary;
  }
};

