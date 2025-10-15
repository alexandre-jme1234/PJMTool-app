# Stage 1: Build environment
ARG NODE_VERSION=22.14.0-alpine
FROM node:${NODE_VERSION}

WORKDIR /app

# Copier uniquement package.json pour optimiser le cache Docker
COPY package.json ./

# Installer toutes les dépendances en une seule commande
RUN npm install && \
    npm install -g @angular/cli@18.2.19 && \
    npm cache clean --force

# Installer Chrome Headless et ses dépendances pour les tests Karma
RUN apk add --no-cache \
    chromium \
    chromium-chromedriver \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    udev \
    xvfb

# Configuration de l'environnement Chrome
ENV CHROME_BIN=/usr/bin/chromium-browser \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copier le reste des fichiers
COPY . .

EXPOSE 4200

CMD ["npm", "start"]


