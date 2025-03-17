#!/bin/bash

# exWork.eu Production Deployment Script
echo "Starting exWork.eu deployment process..."

# Ensure we're in the project root directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

# Check if .env file exists
if [ ! -f .env ]; then
  echo "ERROR: .env file not found!"
  echo "Please create a .env file based on .env.example before deploying."
  exit 1
fi

# Check for required environment variables
if ! grep -q "SESSION_SECRET" .env || ! grep -q "STRIPE_SECRET_KEY" .env || ! grep -q "VITE_STRIPE_PUBLIC_KEY" .env; then
  echo "ERROR: Required environment variables are missing from .env file."
  echo "Please ensure SESSION_SECRET, STRIPE_SECRET_KEY, and VITE_STRIPE_PUBLIC_KEY are set."
  exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the application
echo "Building application..."
npm run build

# Check if build was successful
if [ ! -d "./dist" ]; then
  echo "ERROR: Build failed! Check the logs above for errors."
  exit 1
fi

echo "Build completed successfully! ✅"
echo ""
echo "To start the production server, run: npm run start"
echo "Or if using PM2: pm2 start ecosystem.config.js"
echo ""
echo "For Docker deployment:"
echo "1. Run: docker-compose up -d"
echo ""
echo "For more detailed instructions, see DEPLOYMENT.md and QUICKSTART.md"