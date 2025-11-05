# Image de base
ARG NODE_VERSION=22.14.0-alpine
FROM node:${NODE_VERSION}

# Labels pour la traçabilité
LABEL maintainer="alexandre-jme1234" \
      version="1.0" \
      description="Frontend Angular pour PJMTool" \
      org.opencontainers.image.source="https://github.com/alexandre-jme1234/PJMTool-app"

WORKDIR /app

# Installation de curl pour le healthcheck
RUN apk add --no-cache curl

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation de toutes les dépendances (dev + prod pour le mode développement)
RUN npm install && \
    npm install -g @angular/cli@18.2.19 && \
    npm cache clean --force

# Copie du code source
COPY . .

# Création d'un utilisateur non-root
RUN addgroup -g 1001 appuser && \
    adduser -D -u 1001 -G appuser appuser && \
    chown -R appuser:appuser /app

# Changement vers l'utilisateur non-root
USER appuser

EXPOSE 4200

# Healthcheck pour vérifier que le serveur Angular répond
# Vérifie toutes les 30s, timeout de 10s, 3 tentatives avant unhealthy
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:4200 || exit 1

# Variables d'environnement
ENV NODE_ENV=development \
    NG_CLI_ANALYTICS=false

# Commande de démarrage
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--poll", "2000"]


