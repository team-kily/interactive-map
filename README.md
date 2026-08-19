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

## Admin area

Open `/admin` on the deployed domain, for example
[`https://map.team-kily.de/admin`](https://map.team-kily.de/admin), and sign in
with the password configured in the `ADMIN_PASSWORD` environment variable. Do
not store the production password in this repository. The login remains valid
for eight hours in the current browser. Use **Abmelden** to end the session
earlier.

### Add a location

1. Search for a location using its name, address or postal code.
2. Select a search result to copy the available address, coordinates and
   opening hours into the form.
3. Check and complete the fields manually. Name, city, latitude and longitude
   are required; opening hours are optional.
4. Select **Markt speichern**. The new location is written to Postgres and is
   then available on the public map.

The external search does not always return opening hours. They can be entered
or corrected manually before saving.

### Manage locations and featured cities

- Existing locations are shown under **Vorhandene Märkte** and can be removed
  with **Löschen** after confirming the prompt.
- **Städte in der Kurzliste** contains every city that currently has at least
  one saved location. Selected cities appear as quick-filter buttons above the
  public map.
- After changing the selection, use **Auswahl speichern**. The confirmation is
  displayed directly below that button.

### Admin configuration

The admin area requires these server-side environment variables:

```dotenv
ADMIN_PASSWORD=choose-a-strong-password
AUTH_SECRET=generate-at-least-32-random-characters
DATABASE_URL=postgresql://...
```

Changing `ADMIN_PASSWORD` or `AUTH_SECRET` on Vercel requires a new production
deployment. `AUTH_SECRET` signs the HTTP-only admin cookie and must never be
exposed to client-side code.

## Services and licenses

- Leaflet: BSD-2-Clause
- OpenStreetMap data: ODbL with attribution included in the UI
- Public OpenStreetMap tiles, Nominatim and Overpass: their respective usage policies apply
