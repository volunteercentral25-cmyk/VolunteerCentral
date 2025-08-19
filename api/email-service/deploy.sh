#!/bin/bash

# Email Verification Service Deployment Script
# This script deploys the Flask email service to Vercel

set -e

echo "🚀 Deploying Email Verification Service to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please install it first:"
    echo "npm install -g vercel"
    exit 1
fi

# Check if we're in the correct directory
if [ ! -f "flask_app.py" ]; then
    echo "❌ flask_app.py not found. Please run this script from the api/email-service directory."
    exit 1
fi

# Check if vercel.json exists
if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json not found. Please ensure the Vercel configuration exists."
    exit 1
fi

# Check if requirements.txt exists
if [ ! -f "requirements.txt" ]; then
    echo "❌ requirements.txt not found. Please ensure the requirements file exists."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Set up environment variables in Vercel dashboard:"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - SMTP_SERVER"
echo "   - SMTP_PORT"
echo "   - SMTP_USERNAME"
echo "   - SMTP_PASSWORD"
echo "   - FRONTEND_URL"
echo "   - SECRET_KEY"
echo ""
echo "2. Update your Next.js app's EMAIL_SERVICE_URL environment variable"
echo "3. Test the email verification workflow"
echo ""
echo "🔗 Your email service will be available at the Vercel URL shown above"
