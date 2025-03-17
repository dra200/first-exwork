# exWork.eu Quick Start Guide

This guide provides the fastest way to get exWork.eu running on your private server.

## Option 1: Standard Deployment

### Prerequisites
- Node.js 20.x or higher
- NPM 10.x or higher

### Steps

1. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file with your actual values
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the application**
   ```bash
   npm run build
   ```

4. **Start the server**
   ```bash
   npm run start
   ```

The application will be available at http://localhost:5000 (or the port you specified).

## Option 2: Docker Deployment

### Prerequisites
- Docker
- Docker Compose

### Steps

1. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file with your actual values
   ```

2. **Build and start the containers**
   ```bash
   docker-compose up -d
   ```

The application will be available at http://localhost:5000.

## Important Notes

- The application uses in-memory storage by default. To use PostgreSQL, uncomment the relevant sections in docker-compose.yml and update your .env file.
- Make sure your Stripe API keys are correct for payment processing to work.
- For production deployment, configure a reverse proxy like Nginx and set up SSL.

See the full [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions.