# MB monorepo

Two apps for Maridalen Brenneri:

- [`apps/mb-backoffice`](apps/mb-backoffice) — internal backoffice (Remix)
- [`apps/mb-shop`](apps/mb-shop) — shop web app (React Router / Remix Vite)

Github repo: https://github.com/maridalenbrenneri/mb-backoffice2

## Development

Prerequisites and setup:

- Install Node >= 24
- Install Fly.io command util, https://fly.io/docs/flyctl/install/
- Run `npm install` from the **repo root** (npm workspaces)
- Copy `apps/mb-backoffice/.env.example` => `apps/mb-backoffice/.env`

### Backoffice (port 4001)

1. Start database proxy:

```sh
fly mpg proxy w76geopdnqloplk4
```

(Legacy proxy: flyctl proxy 5432 -a mb-pg)

2. Run:

```sh
npm run dev
# or: npm run dev:backoffice
```

### Shop (port 4002)

```sh
npm run dev:shop
```

## Tools and frameworks

- Remix / React Router — full-stack React frameworks
  - Material UI — UI component library in backoffice (https://mui.com)
- TypeORM — Database ORM (backoffice)
- PostgresSQL — Database hosted on Fly.io (https://fly.io)
- Fly.io — Cloud and run environment (https://fly.io)

## Fly.io devops and deployment

Organization name: Maridalen Brenneri
App name: mb-backoffice

Deploy from the **repo root** (Docker context is the monorepo):

```sh
fly deploy
```

```sh
fly deploy --local-only
```

Deploys app to https://mb-backoffice.fly.dev

### Database

Using Fly.io Managed Postgres

- Database: mb-prod
- User: mb-backoffice

Connection string example, when using database proxy on localhost (env var DATABASE_URL)

DATABASE_URL="postgres://mb-backoffice:password@localhost:16380/mb-prod"

### Fly.io cli commands - tips and tricks

fly ssh console -a mb-backoffice -C 'printenv DATABASE_URL'

fly secrets list

-- Deploy with local build (sometimes faster)
fly deploy --local-only

# App concepts

Everything is based on subscriptions, either a private (PRIVATE) subscription imported from Woo, a gift subscription (PRIVATE_GIFT) or a business subscription (B2B). Non-subscription
orders from Woo are added to a read-only system subscription ("Woo Custom Orders Subscription", id: 2)

For Gift and B2B subscriptions with status ACTIVE re-curring orders are created automatically by a job. Gift subscription orders on STOR-ABO and B2B on 3rd tuesday Delivery days.

There's no "Lill-abo" in the system. Monthly and fortnighly are supported.

# Jobs

Jobs are REST endpoints in `apps/mb-backoffice/app/routes/api`. They can be run from the Scheduled jobs page, and automatically from a Fly.io `cron` process (Supercronic + `crontab`, timezone Europe/Oslo).

After deploying a build that adds the `cron` process group, scale it once:

```sh
fly scale count app=1 cron=1
```

Keep `cron=1` so jobs do not run twice. Logs: `fly logs -a mb-backoffice`. Disable the Google Cloud Scheduler jobs after the first successful Fly runs.

- Import/Sync Woo subscriptions
- Import/Sync Woo gift subscription orders
- Import/Sync Woo orders (recurring and one-time orders)
- Set status on gift subscriptions (activate or complete due to start/end dates)
- Create renewal orders for active gift and B2B subscriptions

# Integrations

Integration libs are located in `apps/mb-backoffice/app/_libs`. All code referencing third party API's is found here.

## Cargonizer

- https://logistra.no/cargonizer-api-documentation.html

## Fiken

- https://api.fiken.no/api/v2/docs/

## Woo

- https://woocommerce.github.io/woocommerce-rest-api-docs
- https://woocommerce.github.io/subscriptions-rest-api-docs

View/Set API key: In Word Press admin go to Woo Commerce => Settings => Advanced => Rest API
