# Vercel Deployment Configuration

## 🚀 Production URLs

### Frontend
- **Deployment URL**: `https://frontend-au1vk8ch9-ashley-lees-projects.vercel.app`
- **Custom Domain**: `https://frontend-brown-two-40.vercel.app`
- **Primary URL**: `https://frontend-brown-two-40.vercel.app`

### Backend
- **Deployment URL**: `https://backend-m3pfrk0xr-ashley-lees-projects.vercel.app`
- **Custom Domain**: `https://backend-phi-seven-76.vercel.app`
- **Primary URL**: `https://backend-phi-seven-76.vercel.app`

## 📁 Configuration Files Updated

### Frontend (`apps/frontend/vercel.json`)
```json
{
  "version": 2,
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://backend-phi-seven-76.vercel.app/api/$1"
    },
    {
      "source": "/health",
      "destination": "https://backend-phi-seven-76.vercel.app/health"
    },
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

## 🔧 Environment Variables

### Frontend Production
```bash
VITE_API_BASE_URL=https://backend-phi-seven-76.vercel.app
VERCEL=1
```

### Backend Production
```bash
JWT_SECRET=your-super-secret-jwt-key-change-in-production-32-chars-minimum
JWT_EXPIRES_IN=7d
COOKIE_NAME=ps_token
NODE_ENV=production
VERCEL=1
CORS_ORIGIN=https://frontend-brown-two-40.vercel.app
```

## 🚀 Deployment Commands

### Deploy Frontend
```bash
cd apps/frontend
vercel --prod
```

### Deploy Backend
```bash
cd apps/backend
vercel --prod
```

## 🔗 API Endpoints

### Production API Endpoints
- **Health Check**: `https://backend-phi-seven-76.vercel.app/health`
- **Authentication**: `https://backend-phi-seven-76.vercel.app/api/auth/*`
- **Providers**: `https://backend-phi-seven-76.vercel.app/api/providers`
- **Appointments**: `https://backend-phi-seven-76.vercel.app/api/appointments`

### Frontend Application
- **Main App**: `https://frontend-brown-two-40.vercel.app`
- **API Proxy**: All `/api/*` requests are proxied to the backend

## 🔒 Security Notes

1. **JWT Secret**: Update the JWT secret in production environment variables
2. **CORS**: Backend is configured to accept requests from the frontend domain
3. **Cookies**: Secure cookie settings for production
4. **Environment**: All production environment variables are set in Vercel dashboard

## 📝 Next Steps

1. Set environment variables in Vercel dashboard for both projects
2. Deploy both frontend and backend to Vercel
3. Test the production URLs
4. Update any hardcoded URLs in the codebase if needed
