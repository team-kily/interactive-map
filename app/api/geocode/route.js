import { isAdmin } from '@/lib/auth';
const externalHeaders = { 'User-Agent': 'Interactive-Map/1.0', Accept: 'application/json' };
async function getJson(url) { const response = await fetch(url, { headers: externalHeaders, cache: 'no-store' }); if (!response.ok) throw new Error(); return response.json(); }
function nominatim(query, limit = 5) { return `https://nominatim.openstreetmap.org/search?${new URLSearchParams({ q: query, format: 'jsonv2', addressdetails: '1', extratags: '1', countrycodes: 'de', limit: String(limit) })}`; }
export async function GET(request) {
  if (!await isAdmin()) return Response.json({ error: 'Nicht autorisiert.' }, { status: 401 });
  const query = new URL(request.url).searchParams.get('q')?.trim().slice(0, 240) || '';
  if (query.length < 3) return Response.json([]);
  try {
    if (/^\d{5}$/.test(query)) {
      const postcode = (await getJson(nominatim(query, 1)))[0]; if (!postcode?.boundingbox) return Response.json([]);
      const [south, north, west, east] = postcode.boundingbox;
      const statement = `[out:json][timeout:12];(nwr["shop"="supermarket"](${south},${west},${north},${east}););out center tags 30;`;
      const overpass = await getJson(`https://overpass-api.de/api/interpreter?${new URLSearchParams({ data: statement })}`);
      const fallbackCity = postcode.address?.city || postcode.address?.town || postcode.address?.suburb || '';
      return Response.json(overpass.elements.filter(el => (!el.tags?.['addr:postcode'] || el.tags['addr:postcode'] === query) && (el.lat || el.center?.lat)).map(el => { const tags = el.tags || {}; const street = tags['addr:street'] || ''; const house = tags['addr:housenumber'] || ''; const city = tags['addr:city'] || fallbackCity; return { lat: String(el.lat || el.center.lat), lon: String(el.lon || el.center.lon), name: tags.name || 'Markt', opening_hours: tags.opening_hours || '', display_name: [tags.name || 'Markt', `${street} ${house}`.trim(), `${tags['addr:postcode'] || query} ${city}`.trim()].filter(Boolean).join(', '), address: { shop: tags.name || 'Markt', road: street, house_number: house, postcode: tags['addr:postcode'] || query, city } }; }));
    }
    return Response.json(await getJson(nominatim(query)));
  } catch { return Response.json({ error: 'Die Standortsuche ist gerade nicht erreichbar.' }, { status: 502 }); }
}
