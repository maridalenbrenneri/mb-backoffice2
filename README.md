# MB Backoffice

MB Backoffice is a Node app written in Typescript. 

## Tools and frameworks
- Remix / React - Full stack client framework (https://remix.run)
  - Material UI - UI component library (https://mui.com) 
- Prisma - Database ORM (https://prisma.io)
- Fly.io - Cloud host used for deployment and as database host (https://fly.io)
- Database: PostgreSQL database hosted on Fly.io

## Integrations
  - Cargonizer
  - Woo
  - Fiken

## Prerequisites
- Node >= 16
- flyctl (Fly.io command utility)

## Development
First run:
- Run "npm install"
- Start local database proxy (see below)

Start locally:
- Run "npm run dev"

## Misc info / commands / etc.

### Fly.io
  App name: mb-app
  Url: https://mb-app.fly.dev

### Database
  Postgres app name: mb-pg
  
  Username:   postgres
  Password:   ### 
  Hostname:   mb-pg.internal
  Proxy Port: 5432
  PG Port: 5433

  We have two databases. Dev/Test: "mb_dev" Production: "mb_prod"

### Start local database proxy
```sh
flyctl proxy 5432 -a mb-pg
```

### Sync database with schema.prisma
```sh
npx prisma db push
```

### Create migration sql file with current schema changes
```sh
npx prisma migrate dev --name init
```

### Deploy app
```sh
fly deploy
```
