FROM node:16.14.2-alpine

# Hide NPM update notifier
ENV NO_UPDATE_NOTIFIER=1

# Set correct timezone
RUN apk add tzdata
RUN cp /usr/share/zoneinfo/Europe/Oslo /etc/localtime

# Create a directory where the application code should live and set it as the
# current working directory
RUN mkdir -p /app
WORKDIR /app

# Copy application files
# Which files are copied is controlled using .dockerignore
COPY . /app/

ENV NODE_ENV=production

# Install npm dependencies
RUN npm ci --only=production --quiet

# Generate prisma models
RUN npx prisma generate

EXPOSE 8080

CMD PORT=8080 npm start