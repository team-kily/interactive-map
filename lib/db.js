import fs from 'node:fs/promises';
import path from 'node:path';
import postgres from 'postgres';
import seedStores from '@/data/stores.json';
import seedSettings from '@/data/settings.json';

const storesFile = path.join(process.cwd(), 'data/stores.json');
const settingsFile = path.join(process.cwd(), 'data/settings.json');
let schemaReady = null;
let sqlClient;

function client() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  sqlClient ??= postgres(url, { max: 1, prepare: false });
  return sqlClient;
}

async function ensureSchema() {
  const sql = client();
  if (!sql) return;
  schemaReady ??= (async () => {
    await sql`create table if not exists stores (
      id text primary key, name text not null, street text not null default '',
      postal_code text not null default '', city text not null,
      lat double precision not null, lng double precision not null,
      hours text not null default '', created_at timestamptz not null default now()
    )`;
    await sql`create table if not exists app_settings (
      key text primary key, value jsonb not null
    )`;
    const [{ count }] = await sql`select count(*)::text as count from stores`;
    if (Number(count) === 0) {
      for (const store of seedStores) {
        await sql`insert into stores (id,name,street,postal_code,city,lat,lng,hours)
          values (${store.id},${store.name},${store.street},${store.postalCode},${store.city},${store.lat},${store.lng},${store.hours})
          on conflict (id) do nothing`;
      }
      await sql`insert into app_settings (key,value) values ('featuredCities',${sql.json(seedSettings.featuredCities)}) on conflict (key) do nothing`;
    }
  })();
  await schemaReady;
}

function rowToStore(row) {
  return { id: String(row.id), name: String(row.name), street: String(row.street), postalCode: String(row.postal_code), city: String(row.city), lat: Number(row.lat), lng: Number(row.lng), hours: String(row.hours) };
}

export async function getStores() {
  const sql = client();
  if (!sql) return JSON.parse(await fs.readFile(storesFile, 'utf8'));
  await ensureSchema();
  return (await sql`select * from stores order by city,name`).map(rowToStore);
}

export async function addStore(store) {
  const sql = client();
  if (!sql) {
    if (process.env.VERCEL) throw new Error('DATABASE_URL fehlt.');
    const stores = await getStores(); stores.push(store);
    await fs.writeFile(storesFile, JSON.stringify(stores, null, 2) + '\n');
    return store;
  }
  await ensureSchema();
  await sql`insert into stores (id,name,street,postal_code,city,lat,lng,hours) values (${store.id},${store.name},${store.street},${store.postalCode},${store.city},${store.lat},${store.lng},${store.hours})`;
  return store;
}

export async function deleteStore(id) {
  const sql = client();
  if (!sql) {
    if (process.env.VERCEL) throw new Error('DATABASE_URL fehlt.');
    await fs.writeFile(storesFile, JSON.stringify((await getStores()).filter(store => store.id !== id), null, 2) + '\n');
    return;
  }
  await ensureSchema(); await sql`delete from stores where id=${id}`;
}

export async function getSettings() {
  const sql = client();
  if (!sql) return JSON.parse(await fs.readFile(settingsFile, 'utf8'));
  await ensureSchema();
  const rows = await sql`select value from app_settings where key='featuredCities'`;
  return { featuredCities: Array.isArray(rows[0]?.value) ? rows[0].value : [] };
}

export async function saveSettings(settings) {
  const sql = client();
  if (!sql) {
    if (process.env.VERCEL) throw new Error('DATABASE_URL fehlt.');
    await fs.writeFile(settingsFile, JSON.stringify(settings, null, 2) + '\n'); return;
  }
  await ensureSchema();
  await sql`insert into app_settings (key,value) values ('featuredCities',${sql.json(settings.featuredCities)}) on conflict (key) do update set value=excluded.value`;
}
