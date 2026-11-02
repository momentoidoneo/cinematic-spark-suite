// Diagnostic previews must not contaminate production advertising/analytics.
export const isProductionTrackingHost = (hostname: string): boolean =>
  ['silviocosta.net', 'www.silviocosta.net'].includes(hostname.toLowerCase());
