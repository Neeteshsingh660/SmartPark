# Stage 1: Build the Spring Boot application
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app

# Copy pom.xml and src from backend folder
COPY backend/pom.xml ./pom.xml
COPY backend/src ./src

# Build the jar skipping tests for fast deployment
RUN mvn clean package -DskipTests

# Stage 2: Run application with Temurin Java 21
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
