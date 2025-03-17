#!/bin/bash

# exWork.eu Packaging Script
# This script creates a deployment package with all necessary files

# Ensure we're in the project root directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR/..

PACKAGE_NAME="exwork-deployment-$(date +%Y%m%d%H%M%S).tar.gz"
echo "Creating deployment package: $PACKAGE_NAME"

# Build the application
echo "Building application..."
npm run build

# Check if build was successful
if [ ! -d "./dist" ]; then
  echo "ERROR: Build failed! Aborting packaging process."
  exit 1
fi

# Create a temporary directory for packaging
TEMP_DIR=$(mktemp -d)
echo "Using temporary directory: $TEMP_DIR"

# Copy required files
echo "Copying files to package..."
mkdir -p $TEMP_DIR/exwork
cp -r dist $TEMP_DIR/exwork/
cp package.json $TEMP_DIR/exwork/
cp package-lock.json $TEMP_DIR/exwork/
cp Dockerfile $TEMP_DIR/exwork/
cp docker-compose.yml $TEMP_DIR/exwork/
cp .env.example $TEMP_DIR/exwork/
cp DEPLOYMENT.md $TEMP_DIR/exwork/
cp QUICKSTART.md $TEMP_DIR/exwork/
cp README.md $TEMP_DIR/exwork/
cp -r scripts $TEMP_DIR/exwork/
cp nginx.conf.example $TEMP_DIR/exwork/
cp ecosystem.config.js.example $TEMP_DIR/exwork/

# Create tar.gz archive
echo "Creating archive..."
cd $TEMP_DIR
tar -czf $PACKAGE_NAME exwork
mv $PACKAGE_NAME $DIR/..

# Clean up
echo "Cleaning up..."
rm -rf $TEMP_DIR

echo "Package created successfully: $PACKAGE_NAME"
echo "You can now deploy this package to your production server."
echo "For deployment instructions, please refer to DEPLOYMENT.md and QUICKSTART.md inside the package."