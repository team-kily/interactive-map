import { isAdmin } from '@/lib/auth';

const externalHeaders = {
  'User-Agent': 'Interactive-Map/1.0',
  Accept: 'application/json',
};

async function getJson(url) {
  const response = await fetch(url, {
    headers: externalHeaders,
    cache: 'no-store',
  });

  if (!response.ok) throw new Error();
  return response.json();
}

function nominatim(query, limit = 5) {
  return `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
    q: query,
    format: 'jsonv2',
    addressdetails: '1',
    extratags: '1',
    countrycodes: 'de',
    limit: String(limit),
  })}`;
}

function isAreaResult(result) {
  return ['city', 'town', 'village', 'municipality', 'postcode'].includes(result?.addresstype)
    || (result?.category === 'boundary' && result?.type === 'administrative');
}

function storeResult(element, fallback = {}) {
  const tags = element.tags || {};
  const street = tags['addr:street'] || '';
  const house = tags['addr:housenumber'] || '';
  const postcode = tags['addr:postcode'] || fallback.postcode || '';
  const city = tags['addr:city'] || fallback.city || '';

  return {
    lat: String(element.lat || element.center.lat),
    lon: String(element.lon || element.center.lon),
    name: tags.name || tags.brand || 'Markt',
    opening_hours: tags.opening_hours || '',
    display_name: [
      tags.name || tags.brand || 'Markt',
      `${street} ${house}`.trim(),
      `${postcode} ${city}`.trim(),
    ].filter(Boolean).join(', '),
    address: {
      shop: tags.name || tags.brand || 'Markt',
      road: street,
      house_number: house,
      postcode,
      city,
    },
  };
}

async function storesWithin(result, fallback = {}) {
  if (!result?.boundingbox) return [];
  const [south, north, west, east] = result.boundingbox;
  const statement = `[out:json][timeout:12];nwr["shop"="supermarket"](${south},${west},${north},${east});out center tags 50;`;
  const overpass = await getJson(`https://overpass-api.de/api/interpreter?${new URLSearchParams({ data: statement })}`);

  return overpass.elements
    .filter((element) => element.lat || element.center?.lat)
    .filter((element) => !fallback.postcode || !element.tags?.['addr:postcode'] || element.tags['addr:postcode'] === fallback.postcode)
    .map((element) => storeResult(element, fallback));
}

export async function GET(request) {
  if (!await isAdmin()) {
    return Response.json({ error: 'Nicht autorisiert.' }, { status: 401 });
  }

  const query = new URL(request.url).searchParams.get('q')?.trim().slice(0, 240) || '';
  if (query.length < 3) return Response.json([]);

  try {
    const places = await getJson(nominatim(query));
    const area = places.find(isAreaResult);

    if (/^\d{5}$/.test(query)) {
      const postcode = area || places[0];
      const city = postcode?.address?.city || postcode?.address?.town || postcode?.address?.village || '';
      return Response.json(await storesWithin(postcode, { postcode: query, city }));
    }

    if (area) {
      const city = area.address?.city || area.address?.town || area.address?.village || area.name || query;
      return Response.json(await storesWithin(area, { city }));
    }

    return Response.json(places);
  } catch {
    return Response.json({ error: 'Die Standortsuche ist gerade nicht erreichbar.' }, { status: 502 });
  }
}
