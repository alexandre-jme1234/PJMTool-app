# Stage 1
ARG NODE_VERSION=22.14.0-alpine
FROM node:${NODE_VERSION}

RUN mkdir -p /app

WORKDIR /app
COPY package.json /app

RUN npm install
RUN npm install dotenv --silent
RUN npm install -g @angular/cli@17.0.2

# Dépendances pour Chrome Headless (tests Karma en CI)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV CHROME_BIN=/usr/bin/chromium \
    PUPPETEER_SKIP_DOWNLOAD=true

COPY . /app

EXPOSE 4200

CMD ["npm", "start"]


