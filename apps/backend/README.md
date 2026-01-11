# KrishiHub Nepal Backend

Spring Boot backend for KrishiHub Nepal - A digital agricultural marketplace platform.

## Tech Stack

- **Java 17**
- **Spring Boot 3.2.1**
- **PostgreSQL** - Database
- **Flyway** - Database migrations
- **JWT** - Authentication
- **Cloudinary** - Image storage
- **WebSocket** - Real-time chat

## Project Structure

```
backend/
├── src/main/java/com/krishihub/
│   ├── KrishiHubApplication.java
│   ├── config/                    # Configuration classes
│   ├── auth/                      # Authentication module
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── entity/
│   │   ├── dto/
│   │   └── security/
│   ├── marketplace/               # Marketplace module (TODO)
│   ├── order/                     # Order module (TODO)
│   ├── payment/                   # Payment module (TODO)
│   ├── messaging/                 # Messaging module (TODO)
│   ├── marketprice/               # Market price module (TODO)
│   └── shared/                    # Shared utilities
│       ├── dto/
│       ├── exception/
│       └── util/
└── src/main/resources/
    ├── application.yml
    ├── application-prod.yml
    └── db/migration/              # Flyway migrations
```

## Setup Instructions

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL 14+

### Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE krishihub;
```

2. Update `application.yml` with your database credentials:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/krishihub
    username: your_username
    password: your_password
```

### Running the Application

1. Build the project:
```bash
mvn clean install
```

2. Run the application:
```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

### Environment Variables

For production, set these environment variables:

```bash
DATABASE_URL=jdbc:postgresql://host:port/database
DATABASE_USERNAME=username
DATABASE_PASSWORD=password
JWT_SECRET=your-256-bit-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
SMS_API_URL=your-sms-gateway-url
SMS_API_KEY=your-sms-api-key
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (sends OTP)
- `POST /api/auth/verify-otp` - Verify OTP and get JWT tokens
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile

### Health Check

- `GET /actuator/health` - Application health status

## Development

### Running Tests

```bash
mvn test
```

### Database Migrations

Flyway migrations are located in `src/main/resources/db/migration/`

To run migrations manually:
```bash
mvn flyway:migrate
```

## Deployment

### Docker

Build Docker image:
```bash
docker build -t krishihub-backend .
```

Run container:
```bash
docker run -p 8080:8080 \
  -e DATABASE_URL=jdbc:postgresql://host:port/database \
  -e JWT_SECRET=your-secret \
  krishihub-backend
```

### Railway / Render

1. Connect your GitHub repository
2. Set environment variables in the dashboard
3. Deploy automatically on push to main branch

## Module Architecture

This is a **modular monolith** designed for easy migration to microservices:

- Each module (auth, marketplace, order, etc.) is self-contained
- Minimal cross-module dependencies
- Clear package boundaries
- Can be extracted to separate services in the future

## License

Proprietary - KrishiHub Nepal
