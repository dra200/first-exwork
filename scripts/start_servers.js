/**
 * Script to start both the main application server and the ML API server
 */

const { spawn } = require('child_process');
const path = require('path');

// Define the path to the ML API server script
const mlApiScript = path.join(__dirname, '..', 'ml', 'api', 'server.py');

console.log('Starting servers...');

// Start the ML API server
console.log('Starting ML API server...');
const mlApi = spawn('python3', [mlApiScript]);

// Handle ML API stdout
mlApi.stdout.on('data', (data) => {
  console.log(`ML API: ${data}`);
});

// Handle ML API stderr
mlApi.stderr.on('data', (data) => {
  console.error(`ML API Error: ${data}`);
});

// Handle ML API process exit
mlApi.on('close', (code) => {
  console.log(`ML API server exited with code ${code}`);
});

// Start the main server
console.log('Starting main application server...');
const mainServer = spawn('npm', ['run', 'dev'], { 
  cwd: path.join(__dirname, '..'),
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