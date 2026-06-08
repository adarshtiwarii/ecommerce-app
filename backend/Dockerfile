FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 10000
# Reduced JVM memory flags for Render free tier — faster startup
ENTRYPOINT ["java", "-Xms64m", "-Xmx256m", "-jar", "app.jar"]