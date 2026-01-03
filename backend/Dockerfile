# Build Stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies first to leverage Docker cache
RUN mvn dependency:go-offline -B
COPY src ./src
# Skip tests in build stage to speed up, they should be run in CI pipeline
RUN mvn clean package -DskipTests

# Run Stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Set ownership to non-root user
RUN chown appuser:appgroup app.jar

# Switch to non-root user
USER appuser


# Expose port (Documentation only, Railway sets PORT env var)
EXPOSE 8080

# Environment variables
ENV SPRING_PROFILES_ACTIVE=prod

# Health check - Use the PORT env var or default to 8080.
# We use curl or wget. Alpine uses wget by default.
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD wget -q --spider http://localhost:${PORT:-8080}/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
