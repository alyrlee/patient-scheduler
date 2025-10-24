# 🚀 Vercel Deployment Guide

This guide covers deploying the Patient Scheduler application to Vercel with both frontend and backend components.

## 📋 Prerequisites

- Vercel account
- GitHub repository
- OpenAI API key
- Domain (optional)

## 🏗️ Architecture

The application is deployed as two separate Vercel projects:

1. **Backend API** (`patient-scheduler-api`)
   - Serverless functions
   - In-memory database (for demo)
   - Authentication & AI endpoints

2. **Frontend** (`patient-scheduler-frontend`)
   - Static site with Vite
   - Proxies API calls to backend
   - React SPA with routing

## 🚀 Deployment Steps

### 1. Deploy Backend API

1. **Connect Repository**:
   ```bash
   # In Vercel dashboard, import from GitHub
   # Select: apps/backend as root directory
   ```

2. **Configure Environment Variables**:
   ```
   JWT_SECRET=your-super-secret-jwt-key
   OPENAI_API_KEY=your-openai-api-key
   NODE_ENV=production
   VERCEL=1
   ```

3. **Deploy Settings**:
   - Framework: Other
   - Build Command: `npm run build`
   - Output Directory: `api`
   - Install Command: `npm install`

### 2. Deploy Frontend

1. **Connect Repository**:
   ```bash
   # In Vercel dashboard, import from GitHub
   # Select: apps/frontend as root directory
   ```

2. **Configure Environment Variables**:
   ```
   VITE_API_BASE_URL=https://patient-scheduler-api.vercel.app
   ```

3. **Deploy Settings**:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 3. Update Backend URL

After deploying the backend, update the frontend's `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://YOUR-BACKEND-URL.vercel.app/api/$1"
    }
  ]
}
```

## 🔧 Configuration Files

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
    }
  ]
}
```

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
      "destination": "https://patient-scheduler-api.vercel.app/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 🗄️ Database Considerations

**Current Setup**: In-memory SQLite database
- ✅ Quick setup for demos
- ❌ Data not persistent
- ❌ Resets on each deployment

**Production Recommendations**:
1. **PostgreSQL** with Vercel Postgres
2. **MongoDB** with Atlas
3. **Supabase** for full-stack solution

### Upgrading to PostgreSQL

1. **Add Vercel Postgres**:
   ```bash
   vercel addons create postgres
   ```

2. **Update Dependencies**:
   ```bash
   npm install @vercel/postgres
   ```

3. **Update Database Code**:
   ```javascript
   import { sql } from '@vercel/postgres';
   
   export async function getProviders() {
     const { rows } = await sql`SELECT * FROM providers`;
     return rows;
   }
   ```

## 🔐 Environment Variables

### Backend Required Variables
```
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
NODE_ENV=production
```

### Frontend Required Variables
```
VITE_API_BASE_URL=https://your-backend.vercel.app
```

## 📊 Monitoring & Analytics

### Vercel Analytics
- Built-in performance monitoring
- Real-time metrics
- Error tracking

### Custom Monitoring
```javascript
// Add to backend for custom metrics
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure frontend proxies to backend
   - Check `vercel.json` rewrites

2. **Database Connection**:
   - In-memory DB resets on each deployment
   - Consider persistent database

3. **Environment Variables**:
   - Check all required variables are set
   - Restart deployment after changes

4. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### Debug Commands

```bash
# Check deployment logs
vercel logs

# Test API endpoints
curl https://your-backend.vercel.app/health

# Check environment variables
vercel env ls
```

## 🔄 CI/CD Pipeline

### Automatic Deployments
- Push to `main` branch triggers deployment
- Preview deployments for pull requests
- Environment-specific configurations

### Manual Deployments
```bash
# Deploy specific branch
vercel --prod

# Deploy with custom environment
vercel --env production
```

## 📈 Performance Optimization

### Backend Optimizations
- Serverless functions with proper timeouts
- Database connection pooling
- Response caching

### Frontend Optimizations
- Static asset optimization
- Code splitting
- Image optimization

## 🔒 Security Considerations

### Production Security
- Strong JWT secrets
- Rate limiting
- Input validation
- HTTPS enforcement

### Environment Security
- Never commit `.env` files
- Use Vercel environment variables
- Rotate secrets regularly

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Serverless Functions Guide](https://vercel.com/docs/functions)
- [Environment Variables](https://vercel.com/docs/environment-variables)
- [Database Integration](https://vercel.com/docs/storage)
