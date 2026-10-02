# Docker build context must be the monorepo root:
#   fly deploy
#   docker build -f apps/mb-backoffice/Dockerfile .
#
# Deploys mb-backoffice only (mb-shop is not part of this image).

# base node image
FROM node:24-bookworm-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# openssl: database connections
# curl: supercronic install + cron job HTTP triggers
# ca-certificates: HTTPS downloads
# tzdata: CRON_TZ=Europe/Oslo
RUN apt-get update && apt-get install -y openssl curl ca-certificates tzdata \
  && rm -rf /var/lib/apt/lists/*

# Latest releases: https://github.com/aptible/supercronic/releases
ENV SUPERCRONIC_VERSION=v0.2.49
RUN set -eux; \
  arch="$(uname -m)"; \
  case "$arch" in \
    x86_64) supercronic_arch=amd64; sha=e63c11a9726b775a6a11801e81af4f3fb926aa68 ;; \
    aarch64) supercronic_arch=arm64; sha=0b6c5bb743e0b0dafed1132198c81807927ac413 ;; \
    *) echo "unsupported architecture: $arch" >&2; exit 1 ;; \
  esac; \
  supercronic="supercronic-linux-${supercronic_arch}"; \
  url="https://github.com/aptible/supercronic/releases/download/${SUPERCRONIC_VERSION}/${supercronic}"; \
  curl -fsSLO --retry 5 --retry-delay 2 --retry-all-errors "$url"; \
  echo "${sha}  ${supercronic}" | sha1sum -c -; \
  chmod +x "$supercronic"; \
  mv "$supercronic" "/usr/local/bin/${supercronic}"; \
  ln -sf "/usr/local/bin/${supercronic}" /usr/local/bin/supercronic

# Install all node_modules, including dev dependencies
FROM base as deps

WORKDIR /myapp

COPY apps/mb-backoffice/package.json ./
RUN npm install --production=false

# Setup production node_modules
FROM base as production-deps

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules
COPY apps/mb-backoffice/package.json ./
RUN npm prune --omit=dev

# Build the app
FROM base as build

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules
COPY apps/mb-backoffice ./
RUN npm run build

# Finally, build the production image with minimal footprint
FROM base

ENV PORT="8080"
ENV NODE_ENV="production"
# Fly machines reach Managed Postgres over IPv6
ENV NODE_OPTIONS="--dns-result-order=ipv6first"

WORKDIR /myapp

COPY --from=production-deps /myapp/node_modules /myapp/node_modules
COPY --from=build /myapp/build /myapp/build
COPY --from=build /myapp/public /myapp/public
COPY apps/mb-backoffice/package.json /myapp/package.json
COPY apps/mb-backoffice/crontab /myapp/crontab
COPY apps/mb-backoffice/scripts /myapp/scripts
RUN chmod +x /myapp/scripts/run-job.sh

EXPOSE 8080

CMD ["npm", "start"]
