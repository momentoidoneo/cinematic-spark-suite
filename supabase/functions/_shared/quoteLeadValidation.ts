export const QUOTE_LEAD_NAME_MIN_LENGTH = 2;
export const QUOTE_LEAD_NAME_MAX_LENGTH = 140;
export const QUOTE_LEAD_EMAIL_MAX_LENGTH = 254;

export const isValidQuoteLeadName = (name: string) => {
  const normalized = name.trim();
  return normalized.length >= QUOTE_LEAD_NAME_MIN_LENGTH &&
    normalized.length <= QUOTE_LEAD_NAME_MAX_LENGTH;
};

export const isValidQuoteLeadEmail = (email: string) => {
  const normalized = email.trim();
  return normalized.length <= QUOTE_LEAD_EMAIL_MAX_LENGTH &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
};
