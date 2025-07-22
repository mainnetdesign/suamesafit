export type DeliveryPeriod =
  | '09:00-13:00'
  | '14:00-18:00'
  | '19:00-21:00';

export const DELIVERY_PERIODS: DeliveryPeriod[] = [
  '09:00-13:00',
  '14:00-18:00',
  '19:00-21:00',
];

/**
 * Configuração das faixas de distância para entrega.
 * Os IDs das variantes devem estar na ordem exata das variantes no Shopify.
 * Os preços são obtidos dinamicamente do Shopify, não hardcoded.
 */
export interface DeliveryDistanceRange {
  /**
   * Distância máxima em km para esta faixa
   */
  maxDistanceKm: number;
  /**
   * Label para exibição
   */
  label: string;
  /**
   * ID da variante do Shopify para esta faixa de distância
   */
  shippingVariantId: string;
}

/**
 * Faixas de distância ordenadas do menor para o maior.
 * IMPORTANTE: Os IDs devem estar na ordem exata das variantes no produto Shopify.
 */
export const DELIVERY_DISTANCE_RANGES: DeliveryDistanceRange[] = [
  {
    maxDistanceKm: 5,
    label: '+5km',
    shippingVariantId: 'gid://shopify/ProductVariant/43101752361029',
  },
  {
    maxDistanceKm: 10,
    label: '+10km', 
    shippingVariantId: 'gid://shopify/ProductVariant/43101752393797',
  },
  {
    maxDistanceKm: 15,
    label: '+15km',
    shippingVariantId: 'gid://shopify/ProductVariant/43134883823685',
  },
  {
    maxDistanceKm: 20,
    label: '+20km',
    shippingVariantId: 'gid://shopify/ProductVariant/43134883856453',
  },
  {
    maxDistanceKm: 25,
    label: '+25km',
    shippingVariantId: 'gid://shopify/ProductVariant/43101752426565',
  },
  {
    maxDistanceKm: 30,
    label: '+30km',
    shippingVariantId: 'gid://shopify/ProductVariant/43101752459333',
  },
  {
    maxDistanceKm: 35,
    label: '+35km',
    shippingVariantId: 'gid://shopify/ProductVariant/43101752492101',
  },
  {
    maxDistanceKm: 40,
    label: '+40km',
    shippingVariantId: 'gid://shopify/ProductVariant/43101752524869',
  },
  {
    maxDistanceKm: 45,
    label: '+45km',
    shippingVariantId: 'gid://shopify/ProductVariant/43101752557637',
  },
  {
    maxDistanceKm: 50,
    label: '+50km',
    shippingVariantId: 'gid://shopify/ProductVariant/43101752590405',
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

/**
 * Encontra a variante de frete baseada na distância calculada.
 * @param distanceKm Distância em quilômetros
 * @returns ID da variante de frete ou null se fora da área de entrega
 */
export function getShippingVariantByDistance(distanceKm: number): string | null {
  // Encontra a primeira faixa que comporta a distância
  const range = DELIVERY_DISTANCE_RANGES.find(
    range => distanceKm <= range.maxDistanceKm
  );
  
  return range ? range.shippingVariantId : null;
}

/**
 * Valida se a distância está dentro da área de entrega
 * @param distanceKm Distância em quilômetros
 * @returns true se dentro da área de entrega
 */
export function isWithinDeliveryArea(distanceKm: number): boolean {
  const maxDistance = Math.max(...DELIVERY_DISTANCE_RANGES.map(r => r.maxDistanceKm));
  return distanceKm <= maxDistance;
} 