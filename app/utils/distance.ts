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
 * Tabela de preços (até 3 km → R$ 5, 3-6 km → R$ 10 …)
 */
export function getShippingVariantId(distanceKm: number): string {
  // Preços (R$) disponíveis nas variantes em múltiplos de 5 até 50
  const priceSteps = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
  const variantIds: Record<number, string> = {
    5: 'gid://shopify/ProductVariant/43101752295493',
    10: 'gid://shopify/ProductVariant/43101752328261',
    15: 'gid://shopify/ProductVariant/43101752361029',
    20: 'gid://shopify/ProductVariant/43101752393797',
    25: 'gid://shopify/ProductVariant/43101752426565',
    30: 'gid://shopify/ProductVariant/43101752459333',
    35: 'gid://shopify/ProductVariant/43101752492101',
    40: 'gid://shopify/ProductVariant/43101752524869',
    45: 'gid://shopify/ProductVariant/43101752557637',
    50: 'gid://shopify/ProductVariant/43101752590405',
  } as const;

  // Calcula preço baseando-se em R$1 por km, arredondando para CIMA ao múltiplo de 5 (mínimo 5, máximo 50)
  let price = Math.ceil(distanceKm); // distância inteira, já arredondada p/ cima
  price = Math.ceil(price / 5) * 5; // próximo múltiplo de 5
  if (price === 0) price = 5;
  if (price > 50) price = 50;

  // Garante que temos id; fallback para 50
  return variantIds[price] ?? variantIds[50];
} 