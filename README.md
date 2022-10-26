# MB Backoffice

MB Backoffice is a Node app written in Typescript. 

## Tools and frameworks
- Remix / React - Full stack client framework (https://remix.run)
  - Material UI - UI component library (https://mui.com) 
- Prisma - Database ORM (https://prisma.io)
- Fly.io - Cloud host used for deployment and as database host (https://fly.io)
- Database: PostgreSQL database hosted on Google Cloud
  - To access database a credentials file and a Cloud SQL Proxy is needed. The credentials file is downloaded from Google Cloud Console.

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
The databases are hosted in Cloud SQL in Google Cloud. To access them a credentials file and a SQL Proxy is needed.

- The credential file can be downloaded from Google Cloud.

#### Install SQL Proxy
Example for MacOS, for other OS's see https://cloud.google.com/sql/docs/mysql/connect-admin-proxy#install

Download SQL proxy and make it executable
```sh
curl -o cloud_sql_proxy https://dl.google.com/cloudsql/cloud_sql_proxy.darwin.amd64

chmod +x cloud_sql_proxy
```

#### Run SQL proxy
```sh
./cloud_sql_proxy -instances=maridalen-brenneri:europe-north1:mb-backoffice=tcp:7001 -credential_file=/Users/bjoda/_private/MB/gcloud/gcloud_maridalen-brenneri-credentials.json
```

Database is then available on localhost:7001

We have two databases. Dev/Test: "mb_backoffice_dev" Production: "mb_backoffice_prod"

Username:   postgres
Password:   ### 
Host:       localhost:7001


  Postgres app name: mb-pg
  
  Username:   postgres
  Password:   ### 
  Hostname:   mb-pg.internal
  Proxy Port: 5432
  PG Port: 5433

  

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
