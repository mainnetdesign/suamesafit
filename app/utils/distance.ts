export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const R = 6371; // raio médio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Recebe a distância em km e devolve o ID da variante de frete correspondente
 * Tabela de preços atualizada com novos valores
 */
export function getShippingVariantId(distanceKm: number): string {
  // Mapeamento de distância para preço baseado na nova tabela
  const distanceToPriceMap: Record<number, number> = {
    5: 16.50,
    10: 21.50,
    15: 29.00,
    20: 36.50,
    25: 44.00,
    30: 51.50,
    35: 59.00,
    40: 66.50,
    45: 74.00,
    50: 81.50,
  };

  const variantIds: Record<number, string> = {
    16.50: 'gid://shopify/ProductVariant/43101752295493',
    21.50: 'gid://shopify/ProductVariant/43101752328261',
    29.00: 'gid://shopify/ProductVariant/43101752361029',
    36.50: 'gid://shopify/ProductVariant/43101752393797',
    44.00: 'gid://shopify/ProductVariant/43101752426565',
    51.50: 'gid://shopify/ProductVariant/43101752459333',
    59.00: 'gid://shopify/ProductVariant/43101752492101',
    66.50: 'gid://shopify/ProductVariant/43101752524869',
    74.00: 'gid://shopify/ProductVariant/43101752557637',
    81.50: 'gid://shopify/ProductVariant/43101752590405',
  } as const;

  // Determina o preço baseado na distância
  let price: number;
  if (distanceKm <= 5) price = 16.50;
  else if (distanceKm <= 10) price = 21.50;
  else if (distanceKm <= 15) price = 29.00;
  else if (distanceKm <= 20) price = 36.50;
  else if (distanceKm <= 25) price = 44.00;
  else if (distanceKm <= 30) price = 51.50;
  else if (distanceKm <= 35) price = 59.00;
  else if (distanceKm <= 40) price = 66.50;
  else if (distanceKm <= 45) price = 74.00;
  else price = 81.50; // 50+ km

  // Garante que temos id; fallback para o preço mais alto
  return variantIds[price] ?? variantIds[81.50];
} 