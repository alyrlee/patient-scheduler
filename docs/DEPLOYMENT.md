# Deployment Guide

## Project Structure
- **Frontend**: React + Vite app (root directory)
- **Backend**: Node.js + Express API (server/ directory)

## Vercel Projects Setup

### 1. Frontend Project (`patient-scheduler`)
**Purpose**: Deploy the React frontend application
**Configuration**: Root `vercel.json`
**Build Command**: `npm run build`
**Output Directory**: `dist/`
**Framework**: Vite

**Features**:
- Static site generation
- SPA routing (all routes → index.html)
- Production optimizations
- Code splitting and lazy loading

### 2. Backend Project (`patient-scheduler-front-end` → rename to `patient-scheduler-api`)
**Purpose**: Deploy the Node.js API server
**Configuration**: `server/vercel.json`
**Entry Point**: `server/index.js`
**Runtime**: Node.js 18.x

**Features**:
- Serverless functions
- API endpoints
- Database connections
- AI integration

## Deployment Commands

### Frontend Deployment
```bash
# From root directory
vercel --prod
```

### Backend Deployment
```bash
# From server directory
cd server
vercel --prod
```

## Environment Variables

### Frontend (if needed)
- `VITE_API_URL`: Backend API URL

### Backend
- `OPENAI_API_KEY`: OpenAI API key
- `NODE_ENV`: production
- Database configuration (if using external DB)

## Project URLs
- **Frontend**: `patient-scheduler-six.vercel.app`
- **Backend**: `patient-scheduler-api.vercel.app` (after renaming)

## API Integration
The frontend should connect to the backend API using the backend's Vercel URL for API calls.
