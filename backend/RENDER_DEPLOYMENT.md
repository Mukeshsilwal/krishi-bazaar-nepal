# Render Deployment Configuration - Backend

## Required Environment Variables

Add these environment variables in your Render service settings:

### Database (PostgreSQL)

**IMPORTANT:** Render provides PostgreSQL URLs in this format:
```
postgresql://user:password@host:port/database
```

But Spring Boot requires JDBC format:
```
jdbc:postgresql://host:port/database
```

**Solution:** Add `jdbc:` prefix to the Render-provided URL:

```
SPRING_DATASOURCE_URL=jdbc:postgresql://dpg-xxxxx-a.oregon-postgres.render.com:5432/your_db_name
SPRING_DATASOURCE_USERNAME=your_db_user
SPRING_DATASOURCE_PASSWORD=your_db_password
```

**Quick Fix:** If Render gives you:
```
postgresql://krishi_user:pass123@dpg-xxxxx-a/krishi_db
```

Convert it to:
```
SPRING_DATASOURCE_URL=jdbc:postgresql://dpg-xxxxx-a.oregon-postgres.render.com:5432/krishi_db
SPRING_DATASOURCE_USERNAME=krishi_user
SPRING_DATASOURCE_PASSWORD=pass123
```

**Note:** Use the **Internal Database URL** from Render for better performance. Make sure to:
1. Add `jdbc:` prefix
2. Include the full hostname with region (e.g., `.oregon-postgres.render.com`)
3. Include port `:5432`
4. Set username and password separately

### Redis (Required for caching)

```
SPRING_DATA_REDIS_HOST=<your-redis-host>
SPRING_DATA_REDIS_PORT=6379
SPRING_DATA_REDIS_PASSWORD=<your-redis-password>
```

**Note:** You can use Render's Redis add-on or an external Redis service like Upstash or Redis Cloud.

### JWT Authentication

```
JWT_SECRET=<generate-a-secure-256-bit-base64-encoded-secret>
```

**Generate a secure secret:**
```bash
openssl rand -base64 32
```

### CORS Configuration

```
CORS_ALLOWED_ORIGINS=https://krishi-bazaar-nepal.vercel.app,https://krishi-bazaar-nepal.vercel.app/,http://localhost:5173
```

### File Upload (Cloudinary)

```
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
```

Sign up at [Cloudinary](https://cloudinary.com/) to get these credentials.

### SMS Service (Optional - for OTP)

```
SMS_API_URL=<your-sms-provider-api-url>
SMS_API_KEY=<your-sms-api-key>
SMS_SENDER_ID=KISAN
```

### Email Service (SendGrid)

```
SENDGRID_API_KEY=<your-sendgrid-api-key>
EMAIL_FROM_ADDRESS=<your-verified-sender-email>
```

Sign up at [SendGrid](https://sendgrid.com/) to get an API key.

### Payment Gateway - eSewa

```
ESEWA_MERCHANT_CODE=<your-esewa-merchant-code>
ESEWA_SECRET_KEY=<your-esewa-secret-key>
ESEWA_BASE_URL=https://epay.esewa.com.np/api/epay/main/v2/form
ESEWA_VERIFY_URL=https://esewa.com.np/api/epay/transaction/status/
ESEWA_SUCCESS_URL=https://your-frontend-domain.vercel.app/payment/success
ESEWA_FAILURE_URL=https://your-frontend-domain.vercel.app/payment/failure
```

**For Testing:**
- Use `EPAYTEST` as merchant code
- Use `8gBm/:&EnhH.1/q` as secret key
- Use test URLs (already configured)

### Payment Gateway - Khalti (Optional)

```
KHALTI_PUBLIC_KEY=<your-khalti-public-key>
KHALTI_SECRET_KEY=<your-khalti-secret-key>
KHALTI_SUCCESS_URL=https://your-frontend-domain.vercel.app/payment/success
KHALTI_FAILURE_URL=https://your-frontend-domain.vercel.app/payment/failure
```

### AI Service (OpenAI) - Optional

```
OPENAI_API_KEY=<your-openai-api-key>
```

**Note:** The current key in the config is exposed and should be replaced with your own key.

### Server Port (Auto-configured by Render)

```
PORT=8089
```

**Note:** Render automatically sets the PORT variable. You can override it if needed.

---

## Deployment Steps

### 1. Create a New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Select the `krishi-bazaar-nepal` repository

### 2. Configure Build Settings

- **Name:** `krishi-bazaar-backend`
- **Region:** Choose closest to your users (e.g., Singapore for Nepal)
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** `Java`
- **Build Command:** `./mvnw clean package -DskipTests`
- **Start Command:** `java -jar target/*.jar`

### 3. Add Environment Variables

Go to the **Environment** tab and add all the variables listed above.

### 4. Add PostgreSQL Database

1. In your Render dashboard, click **New** → **PostgreSQL**
2. Name it `krishi-bazaar-db`
3. Choose the same region as your web service
4. After creation, copy the **Internal Database URL**
5. Add it as `SPRING_DATASOURCE_URL` in your web service

### 5. Add Redis Instance

**Option A: Render Redis (Recommended)**
1. Click **New** → **Redis**
2. Name it `krishi-bazaar-redis`
3. After creation, copy the **Internal Redis URL**
4. Extract host, port, and password and add them as environment variables

**Option B: Upstash Redis (Free tier available)**
1. Sign up at [Upstash](https://upstash.com/)
2. Create a new Redis database
3. Copy the connection details

### 6. Deploy

Click **Create Web Service** and wait for the deployment to complete.

---

## Health Check

After deployment, verify your backend is running:

```
https://your-backend-url.onrender.com/actuator/health
```

You should see:
```json
{
  "status": "UP"
}
```

---

## Important Notes

### Security
- ✅ **Never commit secrets** to your repository
- ✅ **Use strong JWT secrets** (minimum 256 bits)
- ✅ **Rotate API keys** regularly
- ✅ **Use environment-specific URLs** for payment callbacks

### Performance
- ✅ Use **Internal Database URL** for PostgreSQL (faster than external)
- ✅ Use **Internal Redis URL** if using Render Redis
- ✅ Enable **Auto-Deploy** for automatic deployments on git push
- ✅ Consider upgrading to a paid plan for better performance

### CORS
- ✅ Add your Vercel frontend URL to `CORS_ALLOWED_ORIGINS`
- ✅ Include both production and preview URLs if needed
- ✅ Separate multiple origins with commas

### Database Migrations
- ✅ Flyway is enabled and will run migrations automatically
- ✅ Ensure migrations are in `src/main/resources/db/migration`
- ✅ Use `baseline-on-migrate: true` for existing databases

---

## Troubleshooting

### Database URL Format Error

**Error:** `Driver org.postgresql.Driver claims to not accept jdbcUrl, postgresql://...`

**Cause:** Render provides PostgreSQL URLs without the `jdbc:` prefix.

**Solution:**
1. Go to your Render PostgreSQL database
2. Copy the **Internal Database URL**
3. Add `jdbc:` prefix before `postgresql://`
4. Ensure the URL includes the full hostname with region and port

**Example:**
```
# Render provides:
postgresql://user:pass@dpg-xxxxx-a/database

# You need:
jdbc:postgresql://dpg-xxxxx-a.oregon-postgres.render.com:5432/database
```

Or set them separately:
```
SPRING_DATASOURCE_URL=jdbc:postgresql://dpg-xxxxx-a.oregon-postgres.render.com:5432/database
SPRING_DATASOURCE_USERNAME=user
SPRING_DATASOURCE_PASSWORD=pass
```

### Build Fails
- Check that Java 17+ is being used
- Verify Maven wrapper has execute permissions: `chmod +x mvnw`
- Check build logs for dependency issues

### Database Connection Issues
- Verify the database URL format is correct
- Ensure the database is in the same region
- Check that the database is running

### Redis Connection Issues
- Verify Redis host, port, and password
- Check that Redis is accessible from your web service
- Test connection using Redis CLI

### CORS Errors
- Add your frontend URL to `CORS_ALLOWED_ORIGINS`
- Include the protocol (https://)
- Don't include trailing slashes

---

## Minimal Configuration (For Testing)

If you want to deploy quickly for testing, here are the **minimum required** variables:

```
# Database (use Render PostgreSQL)
SPRING_DATASOURCE_URL=<from-render-postgres>
SPRING_DATASOURCE_USERNAME=<from-render-postgres>
SPRING_DATASOURCE_PASSWORD=<from-render-postgres>

# Redis (use Upstash free tier or Render Redis)
SPRING_DATA_REDIS_HOST=<your-redis-host>
SPRING_DATA_REDIS_PORT=6379

# JWT
JWT_SECRET=<generate-with-openssl-rand-base64-32>

# CORS
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
```

All other services (SMS, Email, Payments, AI) are optional and the app will work without them.
