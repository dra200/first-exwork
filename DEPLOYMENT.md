# exWork.eu Deployment Guide

This document provides instructions for deploying the exWork.eu platform to a private hosting environment.

## Prerequisites

- Node.js 20.x or higher
- NPM 10.x or higher
- PostgreSQL database (optional, as the app can use in-memory storage for testing)
- Valid Stripe API keys for payment processing

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
PORT=5000
NODE_ENV=production

# Session Secret (generate a random string)
SESSION_SECRET=your_secure_session_secret_here

# Stripe API Keys
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key

# Database Connection (if using PostgreSQL)
DATABASE_URL=postgresql://username:password@hostname:port/database_name
```

## Deployment Steps

### 1. Clone the Repository

```bash
git clone https://your-repository-url.git
cd exwork-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Application

```bash
npm run build
```

This will create a `dist` directory with the compiled server code and a `dist/client` directory with the optimized frontend assets.

### 4. Start the Server

```bash
npm run start
```

By default, the server will run on port 5000. You can change this by setting the `PORT` environment variable.

## Deployment with PM2 (Recommended for Production)

[PM2](https://pm2.keymetrics.io/) is a production process manager for Node.js applications that helps you keep your app online 24/7.

### 1. Install PM2

```bash
npm install -g pm2
```

### 2. Create a PM2 Configuration File

Create a file named `ecosystem.config.js` in the root directory:

```javascript
module.exports = {
  apps: [
    {
      name: 'exwork',
      script: 'dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }
  ]
};
```

### 3. Start the Application with PM2

```bash
pm2 start ecosystem.config.js
```

### 4. Set PM2 to Start on System Boot

```bash
pm2 startup
pm2 save
```

## Deployment with Docker

You can also deploy the application using Docker for better isolation and consistency across environments.

### 1. Create a Dockerfile

Create a `Dockerfile` in the root directory:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "dist/index.js"]
```

### 2. Build and Run the Docker Image

```bash
docker build -t exwork .
docker run -p 5000:5000 --env-file .env exwork
```

## Nginx Configuration (for Production)

If you're using Nginx as a reverse proxy, here's a basic configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## SSL Configuration

To enable HTTPS, obtain an SSL certificate (e.g., using Let's Encrypt) and update your Nginx configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting

- **Cannot connect to database**: Verify your PostgreSQL connection string and ensure the database server is accessible from your host.
- **Server not starting**: Check the server logs for errors. The most common issues are related to environment variables or port conflicts.
- **Payment processing not working**: Ensure your Stripe API keys are correct and that you're using the live keys in production.

## Maintenance

- **Backups**: Regularly backup your database to prevent data loss.
- **Updates**: Keep your Node.js environment and npm packages up to date to benefit from security patches and improvements.
- **Monitoring**: Set up monitoring for your server to be alerted about potential issues (e.g., high CPU usage, memory leaks, server downtime).

## Support

For any issues or questions regarding deployment, please contact support@exwork.eu.