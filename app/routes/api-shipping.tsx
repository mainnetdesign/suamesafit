import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';
import {haversineDistanceKm, getShippingVariantId} from '~/utils/distance';

const STORE_CEP = '01546000'; // CEP base da loja (São Paulo - 01546-000)
let cachedStoreCoords: {lat: number; lon: number} | null = null;

// Cache em memória para coordenadas de CEPs
const coordsCache = new Map<string, {lat: number; lon: number; state: string; city: string; timestamp: number}>();
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 dias

interface CepData {
  lat: number;
  lon: number;
  state: string;
  city: string;
}

/**
 * Tenta buscar coordenadas do cache
 */
function getCachedCoords(cep: string): CepData | null {
  const cached = coordsCache.get(cep);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`💾 Cache hit para CEP ${cep}`);
    return {lat: cached.lat, lon: cached.lon, state: cached.state, city: cached.city};
  }
  return null;
}

/**
 * Salva coordenadas no cache
 */
function setCachedCoords(cep: string, data: CepData) {
  coordsCache.set(cep, {...data, timestamp: Date.now()});
  console.log(`💾 Cache salvo para CEP ${cep}`);
}

/**
 * Função auxiliar para geocoding se necessário
 */
async function geocodeAddress(city: string, state: string): Promise<{lat: number; lon: number} | null> {
  try {
    console.log(`🌍 Tentando geocoding para ${city}, ${state}`);
    const query = encodeURIComponent(`${city}, ${state}, Brazil`);
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`,
      {
        headers: {
          'User-Agent': 'SuaMesaFit/1.0',
        },
        signal: AbortSignal.timeout(5000),
      }
    );
    
    if (resp.ok) {
      const data = await resp.json();
      if (data.length > 0 && data[0].lat && data[0].lon) {
        console.log(`✅ Geocoding bem-sucedido para ${city}, ${state}`);
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      }
    }
  } catch (error) {
    console.error(`❌ Geocoding falhou para ${city}, ${state}:`, error);
  }
  
  return null;
}

/**
 * Busca CEP com fallback entre múltiplas APIs
 */
async function fetchCepWithFallback(cep: string): Promise<CepData> {
  // Verifica cache primeiro
  const cached = getCachedCoords(cep);
  if (cached) {
    return cached;
  }

  const apis = [
    // API 1: AwesomeAPI (tem coordenadas precisas!)
    {
      name: 'AwesomeAPI',
      url: `https://cep.awesomeapi.com.br/json/${cep}`,
      transform: async (data: any): Promise<CepData | null> => {
        const lat = data.lat ? parseFloat(data.lat) : null;
        const lon = data.lng ? parseFloat(data.lng) : null;
        
        if (lat && lon && !isNaN(lat) && !isNaN(lon)) {
          return {
            lat,
            lon,
            state: data.state,
            city: data.city
          };
        }
        return null;
      }
    },
    // API 2: OpenCEP (pode ter coordenadas)
    {
      name: 'OpenCEP',
      url: `https://opencep.com/v1/${cep}`,
      transform: async (data: any): Promise<CepData | null> => {
        const lat = data.latitude;
        const lon = data.longitude;
        
        if (lat && lon) {
          return {
            lat: parseFloat(lat),
            lon: parseFloat(lon),
            state: data.uf,
            city: data.localidade
          };
        }
        
        // Se não tiver coordenadas, tenta geocoding com mais detalhes
        if (data.logradouro && data.bairro) {
          const coords = await geocodeAddress(`${data.logradouro}, ${data.bairro}, ${data.localidade}`, data.uf);
          if (coords) {
            return {
              lat: coords.lat,
              lon: coords.lon,
              state: data.uf,
              city: data.localidade
            };
          }
        }
        
        return null;
      }
    },
    // API 3: BrasilAPI
    {
      name: 'BrasilAPI',
      url: `https://brasilapi.com.br/api/cep/v2/${cep}`,
      transform: async (data: any): Promise<CepData | null> => {
        const lat = data.location?.coordinates?.latitude;
        const lon = data.location?.coordinates?.longitude;
        
        if (lat && lon) {
          return {
            lat: parseFloat(lat),
            lon: parseFloat(lon),
            state: data.state,
            city: data.city
          };
        }
        
        // Tenta geocoding com mais detalhes se disponível
        if (data.street && data.neighborhood) {
          const coords = await geocodeAddress(`${data.street}, ${data.neighborhood}, ${data.city}`, data.state);
          if (coords) {
            return {
              lat: coords.lat,
              lon: coords.lon,
              state: data.state,
              city: data.city
            };
          }
        }
        
        return null;
      }
    },
    // API 4: ViaCEP (fallback - usa geocoding)
    {
      name: 'ViaCEP',
      url: `https://viacep.com.br/ws/${cep}/json/`,
      transform: async (data: any): Promise<CepData | null> => {
        if (data.erro) return null;
        
        // ViaCEP não retorna coordenadas, usa geocoding com endereço completo
        if (data.logradouro && data.bairro) {
          const coords = await geocodeAddress(`${data.logradouro}, ${data.bairro}, ${data.localidade}`, data.uf);
          if (coords) {
            return {
              lat: coords.lat,
              lon: coords.lon,
              state: data.uf,
              city: data.localidade
            };
          }
        }
        
        return null;
      }
    }
  ];

  const errors: string[] = [];

  for (const api of apis) {
    try {
      console.log(`🔍 Tentando API: ${api.name} (${api.url})`);
      
      const resp = await fetch(api.url, {
        headers: {
          'User-Agent': 'SuaMesaFit/1.0',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(8000), // 8 segundos de timeout
      });
      
      console.log(`📡 ${api.name} - Status: ${resp.status}`);
      
      if (resp.ok) {
        const rawData = await resp.json();
        console.log(`📋 ${api.name} - Dados brutos:`, rawData);
        
        const transformed = await api.transform(rawData);
        
        if (transformed && transformed.lat && transformed.lon) {
          console.log(`✅ Sucesso com ${api.name}:`, transformed);
          
          // Salva no cache
          setCachedCoords(cep, transformed);
          
          return transformed;
        } else {
          console.log(`⚠️ ${api.name} retornou dados incompletos`);
          errors.push(`${api.name}: dados incompletos`);
        }
      } else {
        const errorText = await resp.text();
        console.log(`❌ ${api.name} falhou: ${resp.status} - ${errorText}`);
        errors.push(`${api.name}: HTTP ${resp.status}`);
      }
    } catch (error: any) {
      console.log(`❌ Erro ao consultar ${api.name}:`, error.message);
      errors.push(`${api.name}: ${error.message}`);
      continue;
    }
  }
  
  // Se chegou aqui, todas as APIs falharam
  console.error('❌ Todas as APIs falharam:', errors);
  throw new Error(`Não foi possível consultar o CEP. Tentativas: ${errors.join('; ')}`);
}

export async function loader({request}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const cep = (url.searchParams.get('cep') || '').replace(/\D/g, ''); // apenas dígitos

  console.log(`🚚 API Shipping: Processando CEP ${cep}`);
  console.log(`🌐 Request info:`, {
    host: url.host,
    userAgent: request.headers.get('user-agent'),
    origin: request.headers.get('origin'),
  });

  if (cep.length !== 8) {
    console.log(`❌ CEP inválido: ${cep} (${cep.length} dígitos)`);
    return json({error: 'CEP inválido'}, {status: 400});
  }

  try {
    // Busca dados do CEP com fallback
    console.log(`🔍 Iniciando busca do CEP ${cep} com fallback`);
    const cepData = await fetchCepWithFallback(cep);
    
    console.log(`📍 CEP ${cep}: ${cepData.city}, ${cepData.state}`);
    
    // Verifica se o CEP é de São Paulo
    if (cepData.state !== 'SP') {
      console.log(`❌ CEP fora de alcance: ${cepData.state} (apenas SP)`);
      return json({error: 'CEP fora de alcance - apenas São Paulo'}, {status: 400});
    }

    // Busca (ou usa cache) das coordenadas da loja
    if (!cachedStoreCoords) {
      console.log(`🏪 Buscando coordenadas da loja (CEP ${STORE_CEP})`);
      try {
        const storeData = await fetchCepWithFallback(STORE_CEP);
        cachedStoreCoords = {lat: storeData.lat, lon: storeData.lon};
        console.log(`✅ Coordenadas da loja obtidas:`, cachedStoreCoords);
      } catch (error) {
        console.error(`❌ Erro ao buscar coordenadas da loja:`, error);
        throw new Error('Coordenadas da loja indisponíveis');
      }
    }

    if (!cachedStoreCoords) {
      throw new Error('Coordenadas da loja indisponíveis');
    }

    console.log('📐 Calculando distância com coordenadas:', {
      loja: { lat: cachedStoreCoords.lat, lon: cachedStoreCoords.lon },
      cliente: { lat: cepData.lat, lon: cepData.lon }
    });

    const distanceKm = haversineDistanceKm(
      cachedStoreCoords.lat,
      cachedStoreCoords.lon,
      cepData.lat,
      cepData.lon,
    );
    
    console.log('📏 Distância calculada (raw):', distanceKm);
    console.log('📏 Distância calculada (formatted):', distanceKm.toFixed(2));
    
    const variantId = getShippingVariantId(distanceKm);

    console.log(`✅ Frete calculado: ${distanceKm.toFixed(2)} km → Variante: ${variantId}`);

    return json({variantId, distanceKm});
  } catch (error: any) {
    console.error(`❌ Erro na API Shipping:`, error);
    return json({error: error.message || 'Erro ao calcular frete'}, {status: 500});
  }
} 