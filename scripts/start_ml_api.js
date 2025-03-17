/**
 * Script to start the ML API server
 * This script executes the Python ML API server on port 5001
 */

const { spawn } = require('child_process');
const path = require('path');

// Define the path to the ML API server script
const mlApiScript = path.join(__dirname, '..', 'ml', 'api', 'server.py');

console.log('Starting ML API server...');
console.log(`Script path: ${mlApiScript}`);

// Spawn a new process to run the Python script
const mlApi = spawn('python3', [mlApiScript]);

// Handle stdout
mlApi.stdout.on('data', (data) => {
  console.log(`ML API: ${data}`);
});

// Handle stderr
mlApi.stderr.on('data', (data) => {
  console.error(`ML API Error: ${data}`);
});

// Handle process exit
mlApi.on('close', (code) => {
  console.log(`ML API server exited with code ${code}`);
});

// Handle process errors
mlApi.on('error', (err) => {
  console.error('Failed to start ML API server:', err);
});

// Handle signals to properly shut down the server
process.on('SIGINT', () => {
  console.log('Shutting down ML API server...');
  mlApi.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  console.log('Shutting down ML API server...');
  mlApi.kill();
  process.exit();
});