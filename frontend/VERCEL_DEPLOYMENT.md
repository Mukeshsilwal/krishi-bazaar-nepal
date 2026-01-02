# Vercel Deployment Configuration

## Environment Variables

Add these environment variables in your Vercel project settings:

### Required Variables

```
VITE_API_BASE_URL=https://your-backend-url.com/api
VITE_WS_BASE_URL=wss://your-backend-url.com/ws
VITE_ENV=production
```

### Example for Railway Backend

If your backend is deployed on Railway at `krishi-bazaar-backend.up.railway.app`:

```
VITE_API_BASE_URL=https://krishi-bazaar-backend.up.railway.app/api
VITE_WS_BASE_URL=wss://krishi-bazaar-backend.up.railway.app/ws
VITE_ENV=production
```

## Setting Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: Your backend API URL
   - **Environment**: Production, Preview, Development (select as needed)
4. Click **Save**
5. Redeploy your application

## Important Notes

- **HTTPS/WSS**: Use `https://` for API_BASE_URL and `wss://` for WS_BASE_URL in production
- **CORS**: Ensure your backend allows requests from your Vercel domain
- **No Trailing Slash**: Don't include trailing slashes in URLs
- **Rebuild Required**: After adding/changing environment variables, trigger a new deployment

## Local Development

For local development, create a `.env.local` file (already gitignored):

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your local backend URL (default: `http://localhost:8089`).
