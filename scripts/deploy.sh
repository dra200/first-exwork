#!/bin/bash

# Script to deploy both the main application and ML API server

# Exit on error
set -e

echo "Starting exWork.eu deployment process..."

# Build the frontend and backend
echo "Building the application..."
npm run build

# Create directories if they don't exist
mkdir -p dist/ml
mkdir -p dist/scripts

# Copy ML files to dist directory
echo "Copying ML files..."
cp -r ml/* dist/ml/

# Copy scripts to dist directory
echo "Copying scripts..."
cp scripts/start_ml_api_prod.js dist/scripts/

# Create a production start script
cat > dist/start.js << 'EOF'
/**
 * Production startup script for exWork.eu
 * Starts both the main application server and ML API server
 */

const { spawn } = require('child_process');
const path = require('path');

// Start the ML API server
console.log('Starting ML API server...');
const mlApi = spawn('node', [path.join(__dirname, 'scripts/start_ml_api_prod.js')]);

// Handle ML API stdout
mlApi.stdout.on('data', (data) => {
  console.log(`ML API: ${data}`);
});

// Handle ML API stderr
mlApi.stderr.on('data', (data) => {
  console.error(`ML API Error: ${data}`);
});

// Start the main server
console.log('Starting main application server...');
const mainServer = spawn('node', [path.join(__dirname, 'index.js')], {
  env: { ...process.env, NODE_ENV: 'production' },
  stdio: 'inherit'
});

// Handle process errors
mainServer.on('error', (err) => {
  console.error('Failed to start main server:', err);
});

// Handle signals to properly shut down both servers
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  mlApi.kill();
  mainServer.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  console.log('Shutting down servers...');
  mlApi.kill();
  mainServer.kill();
  process.exit();
});
EOF

# Make sure Python dependencies are installed
echo "Installing Python dependencies..."
pip3 install numpy pandas scikit-learn tensorflow psycopg2-binary flask flask-cors

echo "Deployment files prepared successfully!"
echo "To start the application in production mode, run: node dist/start.js"