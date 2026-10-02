# MB Shop

Customer-facing shop app for Maridalen Brenneri.

## Features

- Sign in with WooCommerce / WordPress account (JWT)
- List the signed-in customer's orders

## Setup

From the monorepo root:

```bash
npm install
cp apps/mb-shop/.env.example apps/mb-shop/.env
```

Set in `apps/mb-shop/.env`:

- `WOO_SECRET_PARAM` — Woo REST query auth (`consumer_key=...&consumer_secret=...`)
- `SESSION_SECRET` — random secret for cookie sessions

## Run

```bash
npm run dev:shop
```

App: http://localhost:4002
