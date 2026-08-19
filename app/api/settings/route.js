import { isAdmin } from '@/lib/auth';
import { getSettings, getStores, saveSettings } from '@/lib/db';
export const runtime = 'nodejs';
export async function GET() { try { return Response.json(await getSettings()); } catch { return Response.json({ featuredCities: [] }); } }
export async function PUT(request) { if (!await isAdmin()) return Response.json({ error: 'Nicht autorisiert.' }, { status: 401 }); const input = await request.json().catch(() => ({})); const available = new Set((await getStores()).map(store => store.city)); const featuredCities = Array.isArray(input.featuredCities) ? [...new Set(input.featuredCities.map(String))].filter(city => available.has(city)) : []; try { await saveSettings({ featuredCities }); return Response.json({ featuredCities }); } catch { return Response.json({ error: 'Die Auswahl konnte nicht gespeichert werden.' }, { status: 500 }); } }
