# 🚀 Vercel Deployment Guide

## Current Status
- ✅ **Frontend**: `https://frontend-brown-two-40.vercel.app` (accessible)
- ✅ **Backend**: `https://backend-phi-seven-76.vercel.app` (accessible)
- ❌ **API Proxy**: Frontend proxy to backend is not working
- ❌ **Backend Environment**: Missing required environment variables

## 🔧 Required Actions

### 1. Set Backend Environment Variables in Vercel Dashboard

Go to your backend project in Vercel dashboard and set these environment variables:

```bash
# Required Environment Variables
JWT_SECRET=your-super-secret-jwt-key-for-production-32-chars-minimum
JWT_EXPIRES_IN=7d
COOKIE_NAME=ps_token
NODE_ENV=production
VERCEL=1
CORS_ORIGIN=https://frontend-brown-two-40.vercel.app

# Optional (for AI features)
OPENAI_API_KEY=your-openai-api-key-here
```

### 2. Set Frontend Environment Variables in Vercel Dashboard

Go to your frontend project in Vercel dashboard and set:

```bash
VITE_API_BASE_URL=https://backend-phi-seven-76.vercel.app
VERCEL=1
```

### 3. Redeploy Both Applications

After setting environment variables, redeploy:

```bash
# Backend
cd apps/backend
vercel --prod

# Frontend  
cd apps/frontend
vercel --prod
```

## 🔍 Current Issues

### Issue 1: Frontend API Proxy
The frontend is configured to proxy API calls, but the proxy is failing. This might be due to:
- Frontend deployment needs to be updated
- Vercel proxy configuration needs adjustment

### Issue 2: Backend Server Error
The backend is returning "Server error" for signup, likely due to:
- Missing environment variables (especially JWT_SECRET)
- Database not initialized in production
- Missing required dependencies

## 🛠️ Troubleshooting Steps

### Step 1: Check Backend Health
```bash
curl https://backend-phi-seven-76.vercel.app/health
```
Should return: `{"ok":true,"timestamp":"...","environment":"production"}`

### Step 2: Test Backend API Directly
```bash
curl -X POST https://backend-phi-seven-76.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!","name":"Test User"}'
```

### Step 3: Test Frontend API Proxy
```bash
curl https://frontend-brown-two-40.vercel.app/api/auth/me
```

## 📋 Environment Variables Checklist

### Backend (Required)
- [ ] `JWT_SECRET` - 32+ character secret key
- [ ] `JWT_EXPIRES_IN` - Token expiration (e.g., "7d")
- [ ] `COOKIE_NAME` - Cookie name (e.g., "ps_token")
- [ ] `NODE_ENV` - Set to "production"
- [ ] `VERCEL` - Set to "1"
- [ ] `CORS_ORIGIN` - Frontend URL

### Frontend (Required)
- [ ] `VITE_API_BASE_URL` - Backend URL
- [ ] `VERCEL` - Set to "1"

## 🚀 Quick Fix Commands

### 1. Update Frontend Configuration
The frontend should use direct API calls instead of proxy:

```json
// apps/frontend/vercel.json - Remove proxy, use direct API calls
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

### 2. Update Frontend API Configuration
Make sure the frontend uses the environment variable:

```javascript
// In your frontend code, use:
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
```

## ✅ Success Criteria

After completing these steps:
1. ✅ Backend health check returns 200
2. ✅ Backend signup/login endpoints work
3. ✅ Frontend can make API calls to backend
4. ✅ Authentication flow works end-to-end

## 📞 Next Steps

1. Set environment variables in Vercel dashboard
2. Redeploy both applications
3. Test the complete authentication flow
4. Verify all API endpoints are working
