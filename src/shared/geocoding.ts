/**
 * Serviço de Geocoding usando Google Maps API
 * 
 * Para configurar:
 * 1. Obtenha uma chave de API no Google Cloud Console
 * 2. Ative a "Geocoding API"
 * 3. Adicione a chave no wrangler.json:
 *    "vars": {
 *      "GOOGLE_MAPS_API_KEY": "sua-chave-aqui"
 *    }
 */

export interface GeocodingResult {
  lat: number;
  lng: number;
  formatted_address: string;
}

export interface GeocodingError {
  error: string;
  status: string;
}

/**
 * Geocodifica um endereço usando a Google Maps Geocoding API
 * 
 * @param address - Endereço completo a ser geocodificado
 * @param apiKey - Chave da API do Google Maps
 * @returns Coordenadas e endereço formatado
 */
export async function geocodeAddress(
  address: string,
  apiKey?: string
): Promise<GeocodingResult> {
  // Se não houver API key, usa fallback local
  if (!apiKey) {
    return geocodeAddressFallback(address);
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formatted_address: result.formatted_address
      };
    } else if (data.status === 'ZERO_RESULTS') {
      throw new Error('Endereço não encontrado. Verifique se está correto.');
    } else if (data.status === 'REQUEST_DENIED') {
      throw new Error('Erro na API de geocoding. Verifique a configuração.');
    } else {
      throw new Error(`Erro ao geocodificar endereço: ${data.status}`);
    }
  } catch (error) {
    // Em caso de erro, tenta fallback
    console.warn('Falha no geocoding via API, usando fallback:', error);
    return geocodeAddressFallback(address);
  }
}

/**
 * Geocoding simplificado para Iguaba Grande (fallback quando API não está disponível)
 * Usa heurísticas baseadas em palavras-chave conhecidas
 */
export function geocodeAddressFallback(address: string): GeocodingResult {
  const addressLower = address.toLowerCase();
  
  // Centro de Iguaba Grande (coordenada padrão)
  const IGUABA_CENTER = { lat: -22.8397, lng: -42.2267 };
  
  // Bairros e regiões conhecidas
  const knownLocations: Record<string, { lat: number; lng: number }> = {
    'centro': { lat: -22.8397, lng: -42.2267 },
    'praia': { lat: -22.8377, lng: -42.2247 },
    'porto': { lat: -22.8350, lng: -42.2250 },
    'sapiatiba': { lat: -22.8420, lng: -42.2310 },
    'ubas': { lat: -22.8450, lng: -42.2280 },
    'morro de são joão': { lat: -22.8330, lng: -42.2200 },
    'sapê': { lat: -22.8380, lng: -42.2350 },
  };
  
  // Tenta encontrar palavra-chave no endereço
  for (const [keyword, coords] of Object.entries(knownLocations)) {
    if (addressLower.includes(keyword)) {
      // Adiciona pequena variação aleatória para endereços diferentes
      const latVariation = (Math.random() - 0.5) * 0.003;
      const lngVariation = (Math.random() - 0.5) * 0.003;
      
      return {
        lat: coords.lat + latVariation,
        lng: coords.lng + lngVariation,
        formatted_address: address
      };
    }
  }
  
  // Se não encontrou palavra-chave, usa centro com variação aleatória
  const latVariation = (Math.random() - 0.5) * 0.01;
  const lngVariation = (Math.random() - 0.5) * 0.01;
  
  return {
    lat: IGUABA_CENTER.lat + latVariation,
    lng: IGUABA_CENTER.lng + lngVariation,
    formatted_address: address
  };
}

/**
 * Valida se coordenadas estão dentro da área de Iguaba Grande
 * Área aproximada: 22.82° a 22.86° S, 42.21° a 42.25° W
 */
export function isInIguabaGrande(lat: number, lng: number): boolean {
  return (
    lat >= -22.86 &&
    lat <= -22.82 &&
    lng >= -42.25 &&
    lng <= -42.21
  );
}

/**
 * Calcula distância entre dois pontos (em km)
 * Usa fórmula de Haversine
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
