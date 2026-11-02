type QuoteCopy = {
  summary: string;
  includes: string[];
  notes: string;
  whatsappMessage: string;
};

// The server may round/reconcile the numeric range after inference. Never leave
// a second, contradictory price embedded in AI prose or in the WhatsApp link.
const mentionsMoney = (text: string) => /€|\bEUR\b|\beuros?\b/iu.test(text);
export function consistentQuoteCopy<T extends QuoteCopy>(quote: T, fallback: QuoteCopy): T {
  return {
    ...quote,
    summary: mentionsMoney(quote.summary) ? fallback.summary : quote.summary,
    includes: quote.includes.some(mentionsMoney) ? fallback.includes : quote.includes,
    notes: mentionsMoney(quote.notes) ? fallback.notes : quote.notes,
    whatsappMessage: fallback.whatsappMessage,
  };
}
