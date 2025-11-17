# Stage 1: Build
FROM eclipse-temurin:17-jdk-focal AS builder

WORKDIR /app

# Copie des fichiers de configuration Maven
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Installation des dépendances système nécessaires
RUN apt-get update && apt-get install -y bash curl unzip ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && chmod +x mvnw

# Pré-téléchargement des dépendances (optimisation du cache Docker)
RUN ./mvnw dependency:go-offline -B

# Copie du code source
COPY src ./src

# Build de l'application
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-focal

# Labels pour la traçabilité et la documentation etet 
LABEL maintainer="alexandre-jme1234" \
      version="1.0" \
      description="Backend Spring Boot pour PJMTool" \
      org.opencontainers.image.source="https://github.com/alexandre-jme1234/PJMTool-app"

WORKDIR /app

# Installation de curl pour le healthcheck
RUN apt-get update && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*

# Création d'un utilisateur non-root pour la sécurité
RUN groupadd -r appuser && useradd -r -g appuser appuser \
    && chown -R appuser:appuser /app

# Copie du JAR depuis le stage de build
COPY --from=builder --chown=appuser:appuser /app/target/*.jar app.jar

# Changement vers l'utilisateur non-root
USER appuser

EXPOSE 8080

# Healthcheck pour vérifier que l'application répond
# Vérifie toutes les 30s, timeout de 10s, 3 tentatives avant de marquer comme unhealthy
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Variables d'environnement pour la JVM (optimisation mémoire)
ENV JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

# Commande de démarrage avec les options JVM
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
