# MB Backoffice

MB Backoffice is a Node app written in Typescript. The app was initially created based on official Remix template/example with Fly.io deployment.

Github repo: https://github.com/maridalenbrenneri/mb-backoffice2

## Development

Before first run:

- Install/Run Node >= 16
- Install flyctl (Fly.io command util), https://fly.io/docs/hands-on/install-flyctl/
- Start local database proxy (see command below)
- Run "npm install" (in app root folder)
- Copy .env.example => .env (in app root folder)

Run app:

- Run "npm run dev"

## Tools and frameworks

- Remix / React - Full stack client framework (https://remix.run)
  - Material UI - UI component library (https://mui.com)
- Prisma - Database ORM (https://prisma.io)
- PostgresSQL - Database hosted on Fly.io (https://fly.io)
- Fly.io - Cloud and run environment (https://fly.io)

## Fly.io devops and deployment

Organization name: Maridalen Brenneri
App name: mb-backoffice

### Deply app

```sh
fly deploy
```

Deploys app to https://mb-backoffice.fly.dev

#### Secrets / env vars

```sh
flyctl secrets set DATABASE_URL=postgres://example.com/mydb

flyctl secrets unset

flyctl secrets list
```

### Database

Postgres app name: mb-pg

- Username: postgres
- Password: ###
- Hostname: mb-pg.internal
- Proxy Port: 5432
- PG Port: 5433

- Dev/Test database: "mb_backoffice_dev"
- Production database: "mb_backoffice_prod"

Connection string example, when using database proxy on localhost (env var DATABASE_URL)

```sh
postgres://username:password@localhost:5432/mb_backoffice_dev
```

### Info / Misc / History

- Deploy scripts were initially created by the "fly launch" command.
- DATABASE_URL was set by the "fly pg attach" command.

### TODOs

#### Task: Deploy dev and prod versions (with different DATABASE_URL)

- How to configure this with Fly.io?

#### Task: Automatic deploys with GitHub Actions

- Commit to branch "dev" => https://mb-backoffice.fly.dev
- Commit to branch "prod" => ...

## Commands

### Start local database proxy

```sh
flyctl proxy 5432 -a mb-pg
```

### Prisma: Sync database with schema.prisma

```sh
npx prisma db push
```

### Prisma: Create migration sql file with current schema changes

```sh
npx prisma migrate dev --name init
```

### Deploy to Fly.io

```sh
fly deploy
```

# Code

/api

# Concepts

Everything is based on a subscription, either a private imported from Woo, a gift subscription or a B2B subscription.

For Gift and B2B with status ACTIVE is re-curring orders created automatically. Gifts on STOR-ABO, B2B on 3rd tuesday.

There's no LILL-ABO. Monthly and fortnighly is supperted.

# TODOs

- Filtering Fiken contacts (only customers)
- Cargonizer info (limit, printer, etc.)
- Settings

# Jobs

- Import Woo
- Complete expired gift subscriptions
- Create re-curring orders for active GIFT and B2B

# Integrations

Integration libs are located in app/\_libs folder. All code referencing third party API's is found here.

## Cargonizer

- https://logistra.no/cargonizer-api-documentation.html
- Woo Commerce

## Fiken

- https://api.fiken.no/api/v2/docs/

## Woo

- https://woocommerce.github.io/woocommerce-rest-api-docs
- https://woocommerce.github.io/subscriptions-rest-api-docs)

View/Set API key: In Word Press admin go to Woo Commerce => Settings => Advanced => Rest API
