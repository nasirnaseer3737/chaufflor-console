# Chaufflor-Style Demo — Chauffeur Booking Website + Admin Console

> **DEMO ONLY — not affiliated with the real Chaufflor.**
> This is an original, Chaufflor-*style* demo inspired only by generic chauffeur-booking
> features (bookings, chauffeurs, vehicles, payments, pricing, airports). It is not the real
> Chaufflor code, it does not connect to any real service, and it contains **no real
> customer data**. All seed data is invented demo data.

## What it is

- **Public site (`/`)** — luxury Dubai / Abu Dhabi chauffeur hero, services
  (Airport pickup, Airport drop-off, Transfer, By the hour, City tour, Business, Wedding),
  fleet classes with AED prices, distance bands (60–400 km) and hourly packages (2–10 h),
  and policies (extra stop AED 50, free waiting 60 min at airports / 15 min elsewhere,
  free cancellation until 12 h before, 50% from 12 h to 3 h before, 100% after).
- **Booking (`/book`)** — a working booking form (name, phone, trip type, pickup,
  drop-off, date/time, passengers, luggage, payment method, name board, notes) with a
  live AED price estimate and a confirmation reference like `CH-2026-XXXX`.
  A booking made here appears in the admin Rides list.
- **Admin console (`/admin`)** — dark sidebar + topbar, with Dashboard KPIs and alerts,
  Rides (filters, search, assign a chauffeur, change status), Schedule (grouped by date),
  New booking, Customers, Chauffeurs, Vehicles (Mulkiya / insurance / RTA expiry),
  Payments (mark reconciled), Vehicle classes & pricing, Pricing rules, Toll gates
  (Salik / Darb), Promo codes, Airports (DXB, DWC, AUH, SHJ with terminals), Campaigns,
  Message log (auto-added on booking / assignment / status change), Team, Settings
  (policies editable and saved), and Integrations (status list only — no real keys).

All data lives in the browser via `localStorage` (key `chaufflor-demo-v1`). There are
no API routes and no server database, so the site can be hosted as static files.
An admin status change persists after reload because it is saved to `localStorage`.

## How the demo admin login works

There is **no default password and no password stored in this repo**.

1. Open `/admin` for the first time: you see a **Create Administrator** form.
2. Create your own password (minimum 12 characters). Only a simple demo hash of it
   is kept in *this browser's* localStorage — this is demo-only, **not production
   security**, and it is never sent anywhere.
3. Afterwards, `/admin` shows a login form. Sign out from the sidebar at any time.
4. Forgot the demo password? Use **Reset demo data** in Settings (or clear this
   site's localStorage) to restore the seed data and recreate the admin.

## Run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Build the static export

```bash
npm run build
# output goes to ./out  (out/index.html, out/book/index.html, out/admin/index.html)
```

## Deploy to GitHub Pages (static export)

This project uses `output: 'export'` and a `basePath` when `GH_PAGES=1` is set,
so the built site works under `https://<user>.github.io/chaufflor-console/`.

```bash
GH_PAGES=1 npm run build
# publish the contents of ./out to the gh-pages branch, e.g. with your usual
# Pages workflow, or:  npx gh-pages -d out
```

> Do **not** deploy this demo as if it were the real Chaufflor service, and do not
> paste real API keys, real customer data, or real payment credentials into it.

## Tech

Next.js 15 + React 19 + TypeScript, no extra runtime dependencies, no Tailwind.
Styling is a single `app/globals.css` (premium dark/gold public theme, dark-sidebar
admin theme, responsive).

## Limitations (demo-only)

- No real drivers, vehicles, payments, SMS/WhatsApp sending, maps, or dispatch.
- No multi-user sync: each browser has its own localStorage copy.
- No server authentication: anyone with the browser can reset the demo.
- Price estimates are demo tables, not live quotes.
