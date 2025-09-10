FROM eclipse-temurin:17-jdk-focal

WORKDIR /app

COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Pré-télécharge les dépendances pour accélérer
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

# Copie du code source
COPY src ./src

EXPOSE 8080

CMD ["./mvnw", "spring-boot:run"]
