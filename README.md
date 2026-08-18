# MB Backoffice

MB Backoffice is a Node app written in Typescript using the React and Remix frameworks.

The app was initially created based on official Remix template/example with Fly.io deployment.

Github repo: https://github.com/maridalenbrenneri/mb-backoffice2

## Development

Prerequisites and setup:

- Install Node >= 20
- Install Fly.io command util, https://fly.io/docs/flyctl/install/
- Run "npm install" (in repo root folder)
- Copy .env.example => .env (in repo root folder)

Run app:

1. Start database proxy:

```sh
fly mpg proxy w76geopdnqloplk4
```

(Legacy proxy: flyctl proxy 5432 -a mb-pg)

2. Run:

```sh
  npm run dev
```

## Tools and frameworks

- Remix / React - Full stack client framework (https://remix.run)
  - Material UI - UI component library (https://mui.com)
- TypeORM - Database ORM
- PostgresSQL - Database hosted on Fly.io (https://fly.io)
- Fly.io - Cloud and run environment (https://fly.io)

## Fly.io devops and deployment

Organization name: Maridalen Brenneri
App name: mb-backoffice

### Deploy app

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

Jobs are implemented as REST endpoints in the routes/api folder. This are triggered from "Scheduled jobs" in Google Cloud. Fly.io doesn't
have this functionality (consider moving to Fly when/if it can be configured there.)

- Import/Sync Woo subscriptions
- Import/Sync Woo gift subscription orders
- Import/Sync Woo orders (recurring and one-time orders)
- Set status on gift subscriptions (activate or complete due to start/end dates)
- Create renewal orders for active gift and B2B subscriptions

# Integrations

Integration libs are located in app/\_libs folder. All code referencing third party API's is found here.

## Cargonizer

- https://logistra.no/cargonizer-api-documentation.html

## Fiken

- https://api.fiken.no/api/v2/docs/

## Woo

- https://woocommerce.github.io/woocommerce-rest-api-docs
- https://woocommerce.github.io/subscriptions-rest-api-docs

View/Set API key: In Word Press admin go to Woo Commerce => Settings => Advanced => Rest API
