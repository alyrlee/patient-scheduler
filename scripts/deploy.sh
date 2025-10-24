#!/bin/bash

# Patient Scheduler Vercel Deployment Script
# This script helps deploy both frontend and backend to Vercel

set -e

echo "🚀 Patient Scheduler Vercel Deployment"
echo "======================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Please install it first:"
    echo "   npm install -g vercel"
    exit 1
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Please run:"
    echo "   vercel login"
    exit 1
fi

echo "✅ Vercel CLI ready"

# Deploy Backend
echo ""
echo "📦 Deploying Backend API..."
cd apps/backend

echo "Setting up environment variables..."
echo "Please set the following environment variables in Vercel:"
echo "  - JWT_SECRET (your-secret-key)"
echo "  - OPENAI_API_KEY (your-openai-key)"
echo "  - NODE_ENV=production"
echo ""

read -p "Press Enter to continue with backend deployment..."

vercel --prod

echo "✅ Backend deployed!"
BACKEND_URL=$(vercel ls | grep "patient-scheduler" | head -1 | awk '{print $2}')
echo "Backend URL: https://$BACKEND_URL"

# Deploy Frontend
echo ""
echo "📦 Deploying Frontend..."
cd ../frontend

echo "Setting up environment variables..."
echo "Please set the following environment variable in Vercel:"
echo "  - VITE_API_BASE_URL=https://$BACKEND_URL"
echo ""

read -p "Press Enter to continue with frontend deployment..."

vercel --prod

echo "✅ Frontend deployed!"
FRONTEND_URL=$(vercel ls | grep "patient-scheduler" | tail -1 | awk '{print $2}')
echo "Frontend URL: https://$FRONTEND_URL"

echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo "Backend:  https://$BACKEND_URL"
echo "Frontend: https://$FRONTEND_URL"
echo ""
echo "Next steps:"
echo "1. Update frontend's vercel.json with backend URL"
echo "2. Set up environment variables in Vercel dashboard"
echo "3. Test the deployed application"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md"
