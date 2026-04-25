#!/bin/bash

# SwasthyaVani Deployment Script
echo "🚀 Deploying SwasthyaVani..."

# Check if we're in the right directory
if [ ! -d "client" ] || [ ! -d "server" ] || [ ! -d "ml-service" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Function to deploy to Vercel
deploy_vercel() {
    echo "📦 Deploying to Vercel..."

    # Install Vercel CLI if not installed
    if ! command -v vercel &> /dev/null; then
        echo "Installing Vercel CLI..."
        npm install -g vercel
    fi

    # Deploy frontend
    echo "🌐 Deploying Frontend..."
    cd client
    npm run build
    vercel --prod --yes
    cd ..

    # Deploy backend
    echo "⚙️  Deploying Backend..."
    cd server
    vercel --prod --yes
    cd ..

    echo "✅ Deployment complete!"
    echo "📋 Don't forget to:"
    echo "   1. Set up MongoDB Atlas database"
    echo "   2. Update environment variables in Vercel dashboard"
    echo "   3. Deploy ML service separately (Heroku recommended)"
}

# Function to deploy to Railway
deploy_railway() {
    echo "🚂 Deploying to Railway..."
    echo "Please visit: https://railway.app"
    echo "1. Connect your GitHub repository"
    echo "2. Add MongoDB database"
    echo "3. Railway will auto-detect and deploy all services"
}

# Function to deploy to Heroku
deploy_heroku() {
    echo "🟣 Deploying to Heroku..."

    # Check if Heroku CLI is installed
    if ! command -v heroku &> /dev/null; then
        echo "❌ Please install Heroku CLI first: https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi

    # Create Heroku apps
    echo "Creating Heroku apps..."
    heroku create swasthyavani-frontend --region eu
    heroku create swasthyavani-backend --region eu
    heroku create swasthyavani-ml --region eu

    # Add buildpacks
    heroku buildpacks:add heroku/nodejs --app swasthyavani-frontend
    heroku buildpacks:add heroku/nodejs --app swasthyavani-backend
    heroku buildpacks:add heroku/python --app swasthyavani-ml

    # Deploy each service
    echo "🚀 Deploying services..."
    git push https://git.heroku.com/swasthyavani-frontend.git main:master
    git push https://git.heroku.com/swasthyavani-backend.git main:master
    git push https://git.heroku.com/swasthyavani-ml.git main:master

    echo "✅ Heroku deployment complete!"
}

# Main menu
echo "Choose deployment platform:"
echo "1) Vercel (Recommended - Easy & Fast)"
echo "2) Railway (Full stack - Auto-scaling)"
echo "3) Heroku (Traditional - More control)"
echo "4) Manual deployment guide"
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        deploy_vercel
        ;;
    2)
        deploy_railway
        ;;
    3)
        deploy_heroku
        ;;
    4)
        echo "📖 Check DEPLOYMENT.md for manual deployment instructions"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment initiated!"
echo "📧 Check your email for deployment notifications"
echo "🔗 Update your .env files with production URLs after deployment"