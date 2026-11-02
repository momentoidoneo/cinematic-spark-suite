const hasId = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const isSavedContact = (data: unknown): data is { success: true; id: string } => {
  if (!data || typeof data !== "object") return false;
  const value = data as Record<string, unknown>;
  return value.success === true && hasId(value.id) && !value.error;
};

export const isSavedQuote = (data: unknown): boolean => {
  if (!data || typeof data !== "object") return false;
  const value = data as Record<string, unknown>;
  return hasId(value.requestId) && !value.error &&
    typeof value.min === "number" && Number.isFinite(value.min) && value.min >= 0 &&
    typeof value.max === "number" && Number.isFinite(value.max) && value.max >= value.min &&
    typeof value.summary === "string" && Array.isArray(value.includes);
};

// Explicit diagnostic markers only; never send customer identity to analytics.
export const isControlledTestLead = (...values: Array<string | undefined>): boolean =>
  /\b(?:SC-ADS-\d{8}-\d+|prueba técnica autorizada)\b/i.test(values.join(" "));
