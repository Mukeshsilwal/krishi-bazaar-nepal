# Railway Deployment Configuration - Backend

## Preferred Deployment Method: Dockerfile

This project includes a production-ready `Dockerfile` in the `backend/` directory. This is the most reliable way to deploy on Railway.

## Required Environment Variables

Add these in your Railway Service settings (Variables tab):

### Database (PostgreSQL)

Railway provides a `DATABASE_URL` variable automatically when you add a PostgreSQL plugin.
However, Spring Boot requires the `jdbc:` prefix.

**Recommended Configuration:**

1.  **Add a Custom Variable**:
    -   Key: `SPRING_DATASOURCE_URL`
    -   Value: `jdbc:${DATABASE_URL}` (Railway allows referencing other variables)
    
    *Note: If `jdbc:${DATABASE_URL}` doesn't resolve correctly (sometimes protocol `postgres://` vs `jdbc:postgresql://` mismatch), use the full connection string manually:*
    `jdbc:postgresql://<host>:<port>/<database>`

2.  **Username/Password**:
    -   `SPRING_DATASOURCE_USERNAME`: `${PGUSER}`
    -   `SPRING_DATASOURCE_PASSWORD`: `${PGPASSWORD}`

### Redis

Railway provides `REDIS_URL` automatically.
Our application is configured to use `REDIS_URL` directly.

-   Ensure `REDIS_URL` is available (Railway adds this by default when you add Redis).

### Other Variables (Same as Render)

```bash
# JWT
JWT_SECRET=<your-secure-secret>

# CORS
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>

# Port (Optional, Railway sets PORT automatically)
# PORT=8080 
```

---

## Deployment Steps

### 1. Create New Project on Railway
1.  Go to [Railway Dashboard](https://railway.app)
2.  Click **New Project** -> **GitHub Repo**
3.  Select `krishi-bazaar-nepal`

### 2. Configure Backend Service
1.  Click on the repo card.
2.  Go to **Settings** -> **Root Directory**.
3.  Set it to `/backend`.
4.  Railway should automatically detect the `Dockerfile`.

### 3. Add Database & Redis
1.  Right-click on the canvas (or click **New**).
2.  Select **Database** -> **PostgreSQL**.
3.  Select **Database** -> **Redis**.
4.  These will automatically link variables to your project, but you might need to map them (see Environment Variables above).

### 4. Verify Build
-   The build should use the `Dockerfile`.
-   It uses Maven to build and a lightweight JRE to run.

### 5. Health Check
-   Railway allows setting a health check path.
-   Path: `/actuator/health`

---

## Troubleshooting

### "Manifest not found" or Docker Error
Ensure your **Root Directory** in Railway settings is set to `/backend`.

### Database Connection Fails
Check the `SPRING_DATASOURCE_URL`. It **must** start with `jdbc:postgresql://`.
If Railway's `DATABASE_URL` starts with `postgres://`, you might need to manually construct the value:
`jdbc:postgresql://${PGHOST}:${PGPORT}/${PGDATABASE}`
