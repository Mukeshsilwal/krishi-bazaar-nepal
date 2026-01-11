# KrishiHub Nepal - Complete Backend Setup Guide

## Quick Start

### 1. Install PostgreSQL

**Windows:**
```powershell
# Download and install from: https://www.postgresql.org/download/windows/
# Or use chocolatey:
choco install postgresql

# Start PostgreSQL service
net start postgresql-x64-14
```

**Create Database:**
```sql
-- Open psql or pgAdmin and run:
CREATE DATABASE krishihub;
CREATE USER krishihub_user WITH PASSWORD 'krishihub123';
GRANT ALL PRIVILEGES ON DATABASE krishihub TO krishihub_user;
```

### 2. Configure Application

Create `.env` file in `backend/` directory (copy from `.env.example`):

```bash
# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/krishihub
DATABASE_USERNAME=krishihub_user
DATABASE_PASSWORD=krishihub123

# JWT (generate a secure key for production)
JWT_SECRET=your-secret-key-at-least-256-bits-long-change-this-in-production

# Cloudinary (optional for development)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# SMS (optional - will log to console if not configured)
SMS_API_URL=
SMS_API_KEY=
```

### 3. Build and Run

```bash
cd backend

# Install dependencies and build
mvn clean install

# Run the application
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 4. Test the API

**Health Check:**
```bash
curl http://localhost:8080/actuator/health
```

**Register a Farmer:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "mobileNumber": "9841234567",
    "name": "Ram Bahadur",
    "role": "FARMER",
    "district": "Kathmandu",
    "ward": "5",
    "landSize": "2.5"
  }'
```

**Check Console for OTP** (will be logged since SMS is not configured)

**Verify OTP:**
```bash
curl -X POST http://localhost:8080/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "mobileNumber": "9841234567",
    "otp": "123456"
  }'
```

**Create a Crop Listing:**
```bash
curl -X POST http://localhost:8080/api/listings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "cropName": "टमाटर (Tomato)",
    "quantity": 100,
    "unit": "kg",
    "pricePerUnit": 85,
    "description": "Fresh organic tomatoes",
    "location": "Kathmandu"
  }'
```

**Browse Listings:**
```bash
curl http://localhost:8080/api/listings?page=0&size=10
```

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Request OTP | No |
| POST | `/api/auth/verify-otp` | Verify OTP & get JWT | No |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/me` | Update profile | Yes |

### Marketplace Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/listings` | Create listing | Yes (Farmer) |
| GET | `/api/listings` | Browse all listings | No |
| GET | `/api/listings/{id}` | Get listing details | No |
| GET | `/api/listings/my` | Get my listings | Yes (Farmer) |
| PUT | `/api/listings/{id}` | Update listing | Yes (Owner) |
| DELETE | `/api/listings/{id}` | Delete listing | Yes (Owner) |
| POST | `/api/listings/{id}/images` | Upload image | Yes (Owner) |
| GET | `/api/listings/crops` | Get available crops | No |

### Query Parameters for Listings

- `page` - Page number (default: 0)
- `size` - Page size (default: 20)
- `cropName` - Filter by crop name
- `district` - Filter by district
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `sortBy` - Sort options: `price_asc`, `price_desc`, `quantity_asc`, `quantity_desc`, `name`

## Database Schema

The application uses Flyway for database migrations. Migrations are automatically applied on startup.

**Current Migrations:**
- V1: Users table
- V2: OTP verifications table
- V3: Crop listings table
- V4: Crop images table

## Development Tips

### Hot Reload

Spring Boot DevTools is included. Changes to Java files will trigger automatic restart.

### Database Console

Access H2 console (if using H2 for testing):
```
http://localhost:8080/h2-console
```

### Logging

Check logs for OTP codes during development:
```
=== OTP for +9779841234567 ===
OTP: 123456
==================
```

### Testing with Postman

Import the API collection (create one with all endpoints) or use the curl commands above.

## Production Deployment

### Environment Variables

Set these in your hosting platform:

```bash
DATABASE_URL=jdbc:postgresql://host:port/database
DATABASE_USERNAME=username
DATABASE_PASSWORD=password
JWT_SECRET=your-production-secret-key-256-bits
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
SMS_API_URL=https://api.sparrowsms.com/v2/sms/
SMS_API_KEY=your-sms-api-key
```

### Deploy to Railway

1. Push code to GitHub
2. Connect repository to Railway
3. Set environment variables
4. Deploy automatically

### Deploy to Render

1. Create new Web Service
2. Connect GitHub repository
3. Build Command: `mvn clean install`
4. Start Command: `java -jar target/*.jar`
5. Set environment variables

## Troubleshooting

### Port Already in Use
```bash
# Change port in application-dev.yml
server:
  port: 8081
```

### Database Connection Failed
- Check PostgreSQL is running
- Verify credentials in application.yml
- Check firewall settings

### Flyway Migration Failed
```bash
# Clean and rebuild
mvn flyway:clean
mvn spring-boot:run
```

## Next Steps

- [ ] Implement Order module
- [ ] Add Payment integration (eSewa, Khalti)
- [ ] Build Messaging module (WebSocket chat)
- [ ] Create Market Price module
- [ ] Add API documentation (Swagger)
- [ ] Write unit tests
- [ ] Set up CI/CD pipeline

## Support

For issues or questions, check the main README.md or create an issue in the repository.
