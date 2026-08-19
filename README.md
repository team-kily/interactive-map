# Team Kily – interaktive Supermarktkarte

Vercel-compatible JavaScript location map built with Next.js, Leaflet, OpenStreetMap and Postgres. It includes a synchronized map/list view, city filters and a protected administration area for searching, adding and deleting locations.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Without `DATABASE_URL`, local development uses the JSON files in `data/`. The default local admin password is `bitte-aendern`; set `ADMIN_PASSWORD` in `.env.local` to override it.

## Deploying to Vercel

1. Import the Git repository into Vercel.
2. Add a Postgres integration such as Neon through the Vercel Marketplace.
3. Ensure the integration supplies `DATABASE_URL`.
4. Add `ADMIN_PASSWORD` and a random `AUTH_SECRET` with at least 32 characters to Production, Preview and Development.
5. Deploy. On the first database request, the schema is created and the records from `data/stores.json` and `data/settings.json` are imported automatically.

The production app deliberately refuses file-based writes when `DATABASE_URL` is missing.

## Routes

- `/` public map
- `/admin` administration
- `/api/stores`, `/api/settings`, `/api/geocode`, `/api/auth` serverless Route Handlers

## Services and licenses

- Leaflet: BSD-2-Clause
- OpenStreetMap data: ODbL with attribution included in the UI
- Public OpenStreetMap tiles, Nominatim and Overpass: their respective usage policies apply
