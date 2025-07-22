import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';
import {haversineDistanceKm, getShippingVariantId} from '~/utils/distance';

const STORE_CEP = '01546000'; // CEP base da loja (São Paulo - 01546-000)
let cachedStoreCoords: {lat: number; lon: number} | null = null;

export async function loader({request}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const cep = (url.searchParams.get('cep') || '').replace(/\D/g, ''); // apenas dígitos

  console.log(`🚚 API Shipping: Processando CEP ${cep}`);

  if (cep.length !== 8) {
    console.log(`❌ CEP inválido: ${cep} (${cep.length} dígitos)`);
    return json({error: 'CEP inválido'}, {status: 400});
  }

  try {
    // Usa AwesomeAPI para pegar lat/lon
    console.log(`🔍 Consultando CEP na API externa: ${cep}`);
    const resp = await fetch(`https://cep.awesomeapi.com.br/json/${cep}`);
    console.log(`📡 Status da resposta: ${resp.status}`);
    
    if (!resp.ok) {
      const errorText = await resp.text();
      console.log(`❌ Erro na API externa: ${resp.status} - ${errorText}`);
      throw new Error('Falha ao consultar CEP');
    }
    
    const data = (await resp.json()) as {lat: string; lng: string; state: string; city: string};
    console.log(`📋 Dados recebidos:`, data);
    const lat = parseFloat(data.lat);
    const lon = parseFloat(data.lng);
    if (isNaN(lat) || isNaN(lon)) {
      throw new Error('Lat/Lon não encontrados para o CEP');
    }

    // Verifica se o CEP é de São Paulo
    console.log(`📍 CEP ${cep}: ${data.city}, ${data.state}`);
    if (data.state !== 'SP') {
      console.log(`❌ CEP fora de alcance: ${data.state} (apenas SP)`);
      throw new Error('CEP fora de alcance - apenas São Paulo');
    }

    // Busca (ou usa cache) das coordenadas da loja
    if (!cachedStoreCoords) {
      const storeResp = await fetch(
        `https://cep.awesomeapi.com.br/json/${STORE_CEP}`,
      );
      if (storeResp.ok) {
        const storeData = (await storeResp.json()) as {lat: string; lng: string};
        const sLat = parseFloat(storeData.lat);
        const sLon = parseFloat(storeData.lng);
        if (!isNaN(sLat) && !isNaN(sLon)) {
          cachedStoreCoords = {lat: sLat, lon: sLon};
        }
      }
    }

    if (!cachedStoreCoords) {
      throw new Error('Coordenadas da loja indisponíveis');
    }

    const distanceKm = haversineDistanceKm(
      cachedStoreCoords.lat,
      cachedStoreCoords.lon,
      lat,
      lon,
    );
    const variantId = getShippingVariantId(distanceKm);

    console.log(`✅ Frete calculado: ${distanceKm.toFixed(2)} km → Variante: ${variantId}`);

    return json({variantId, distanceKm});
  } catch (error: any) {
    console.error(`❌ Erro na API Shipping:`, error);
    return json({error: error.message || 'Erro ao calcular frete'}, {status: 500});
  }
} 