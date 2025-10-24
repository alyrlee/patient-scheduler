# 🔧 Production Deployment Fix

## Current Issues Identified

### 1. Backend Server Error
- **Issue**: Backend returns "Server error" for signup
- **Cause**: Missing environment variables in Vercel dashboard
- **Fix**: Set required environment variables

### 2. Frontend API Proxy
- **Issue**: Frontend proxy to backend is failing
- **Cause**: Vercel proxy configuration issues
- **Fix**: Use direct API calls instead of proxy

## ✅ Configuration Updates Made

### Frontend (`apps/frontend/vercel.json`)
```json
{
  "version": 2,
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "VITE_API_BASE_URL": "https://backend-phi-seven-76.vercel.app"
  }
}
```

### Backend (`apps/backend/vercel.json`)
```json
{
  "version": 2,
  "functions": {
    "api/index.js": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.js"
    },
    {
      "source": "/health",
      "destination": "/api/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "CORS_ORIGIN": "https://frontend-brown-two-40.vercel.app"
  }
}
```

## 🚀 Required Actions

### 1. Set Backend Environment Variables in Vercel Dashboard

Go to your backend project in Vercel dashboard → Settings → Environment Variables and add:

```bash
JWT_SECRET=your-super-secret-jwt-key-for-production-32-chars-minimum
JWT_EXPIRES_IN=7d
COOKIE_NAME=ps_token
NODE_ENV=production
VERCEL=1
CORS_ORIGIN=https://frontend-brown-two-40.vercel.app
OPENAI_API_KEY=your-openai-api-key-here
```

### 2. Set Frontend Environment Variables in Vercel Dashboard

Go to your frontend project in Vercel dashboard → Settings → Environment Variables and add:

```bash
VITE_API_BASE_URL=https://backend-phi-seven-76.vercel.app
VERCEL=1
```

### 3. Redeploy Both Applications

```bash
# Backend
cd apps/backend
vercel --prod

# Frontend
cd apps/frontend
vercel --prod
```

## 🧪 Testing Commands

### Test Backend Health
```bash
curl https://backend-phi-seven-76.vercel.app/health
```

### Test Backend Signup
```bash
curl -X POST https://backend-phi-seven-76.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!","name":"Test User"}'
```

### Test Frontend
```bash
curl https://frontend-brown-two-40.vercel.app
```

## ✅ Expected Results

After completing these steps:

1. ✅ Backend health check returns 200 with proper JSON response
2. ✅ Backend signup returns 201 with user data
3. ✅ Frontend loads without errors
4. ✅ Frontend can make API calls to backend
5. ✅ Authentication flow works end-to-end

## 🔍 Troubleshooting

If issues persist:

1. **Check Vercel Function Logs**: Go to Vercel dashboard → Functions → View logs
2. **Verify Environment Variables**: Ensure all required variables are set
3. **Check CORS**: Verify CORS_ORIGIN matches frontend URL
4. **Database Issues**: Backend uses in-memory database for Vercel (not persistent)

## 📝 Notes

- The backend uses an in-memory SQLite database for Vercel deployment
- Database is recreated on each function invocation
- For production, consider using a persistent database like PostgreSQL
- All authentication state is stored in JWT cookies
