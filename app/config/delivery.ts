export type DeliveryPeriod =
  | '09:00-13:00'
  | '14:00-18:00'
  | '19:00-21:00';

export const DELIVERY_PERIODS: DeliveryPeriod[] = [
  '09:00-13:00',
  '14:00-18:00',
  '19:00-21:00',
];

export interface DeliveryZone {
  /**
   * Unique identifier for the zone.
   */
  id: string;
  /**
   * Human-friendly label (optional).
   */
  label?: string;
  /**
   * Accepted CEP (postal‐code) prefixes OR a custom boolean matcher.
   * Use simple string prefixes for now (e.g. '010', '011'). Later you can
   * replace this with a radius-based approach via OpenRouteService.
   */
  cepPrefixes: string[];
  /**
   * Shopify variant ID that represents the shipping/frete item for this zone.
   */
  shippingVariantId: string;
}

/**
 * Update this array to add/remove delivery zones.
 * When you receive the correct variant IDs, just replace the placeholders.
 */
export const DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'sao-paulo',
    label: 'São Paulo (raio teste)',
    cepPrefixes: ['010', '011', '012', '013', '014', '015', '016', '017', '018', '019'],
    // TODO: substitua pelo ID real do variant de frete desta zona
    shippingVariantId: 'gid://shopify/ProductVariant/REPLACE_ME_SP',
  },
];

/**
 * Very naive CEP validator.
 *  – Accepts only 8-digit CEPs (with or without hyphen)
 *  – Returns digits-only string or null.
 */
export function sanitizeCep(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length !== 8) return null;
  return digits;
}

export interface CepValidationResult {
  valid: boolean;
  zone?: DeliveryZone;
  message?: string;
}

/**
 * Client-side sync validation by CEP prefix.
 * Later you can replace this logic with an async fetch to OpenRouteService
 * to calculate distance & zone dynamically.
 */
export function validateCepLocally(cep: string): CepValidationResult {
  const sanitized = sanitizeCep(cep);
  if (!sanitized) {
    return {valid: false, message: 'CEP inválido'};
  }
  const prefix = sanitized.substring(0, 3);
  const zone = DELIVERY_ZONES.find((z) => z.cepPrefixes.includes(prefix));
  if (!zone) {
    return {valid: false, message: 'Fora da área de entrega'};
  }
  return {valid: true, zone};
} 