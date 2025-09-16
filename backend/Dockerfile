FROM eclipse-temurin:17-jdk-focal

WORKDIR /app

COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN ls -la && head -5 mvnw

# Pré-télécharge les dépendances pour accélérer
RUN apt-get update && apt-get install -y bash curl unzip ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

# Copie du code source
COPY src ./src

EXPOSE 8080

CMD ["./mvnw", "spring-boot:run"]
