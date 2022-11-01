# MB Backoffice

MB Backoffice is a Node app written in Typescript. The app was initially created based on official Remix template/example with Fly.io deployment.

Github repo: https://github.com/maridalenbrenneri/mb-backoffice2

## Development
First run:
- Run node >= 16
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
- Database: PostgreSQL database hosted on Fly.io (https://fly.io)
- Deploy - Runs on Fly.io (https://fly.io)

## Integrations
- Cargonizer
- Woo Commerce
- Fiken

Integration libs are located in app/_libs folder. All code referencing third party API's is found here.

## Fly.io devops and deployment
- Deploy scripts were initially created by the "fly launch" command.
- DATABASE_URL is set by "fly pg attach" command.

App is automatically deployed on commit with Github Actions.
- Branch "dev" => https://mb-backoffice.fly.dev
- Branch "prod" => ...

### Fly.io app info
App name: mb-backoffice

### Database info
Postgres app name: mb-pg

Username:   postgres
Password:   ### 
Hostname:   mb-pg.internal
Proxy Port: 5432
PG Port:    5433

There are two databases in the cluster, "mb_backoffice" (development/test) and "???" (production database)

Connection string example: postgres://username:password@localhost:5432/mb_dev

## Misc info / commands / etc.

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

### Deploy app (manual deploy)
```sh
fly deploy
```
