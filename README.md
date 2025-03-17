# exWork.eu Platform

exWork.eu is a B2B marketplace platform connecting businesses with tech service providers. The platform facilitates project posting, proposal submission, secure payment processing, and communication between parties.

## Features

- **User Roles**: Separate dashboards for buyers (businesses) and sellers (service providers)
- **Project Management**: Post projects, submit proposals, track progress
- **Messaging System**: Built-in communication between buyers and sellers
- **Payment Processing**: Secure payment handling with Stripe integration (15% platform commission)
- **Responsive Design**: Works on mobile, tablet, and desktop devices

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn UI components
- **Backend**: Node.js, Express.js
- **Database**: In-memory storage (can be connected to PostgreSQL)
- **Authentication**: Session-based with Passport.js
- **Payment**: Stripe API integration
- **Deployment**: Docker support, PM2 configuration

## Quick Start

For quick deployment instructions, see [QUICKSTART.md](QUICKSTART.md).

## Detailed Deployment

For detailed deployment instructions including Docker, PM2, and Nginx configuration, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Development

To start the development server:

```bash
npm install
npm run dev
```

The application will be available at http://localhost:5000.

## Environment Variables

Create a `.env` file based on `.env.example` with the following variables:

```
# Required
SESSION_SECRET=your_secure_session_secret
VITE_STRIPE_PUBLIC_KEY=pk_your_stripe_public_key
STRIPE_SECRET_KEY=sk_your_stripe_secret_key

# Optional (for PostgreSQL)
DATABASE_URL=postgresql://username:password@hostname:port/database_name

# Optional (for email notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASSWORD=your_smtp_password
EMAIL_FROM=noreply@exwork.eu
```

## Production Deployment

To build for production:

```bash
npm run build
```

To start the production server:

```bash
npm run start
```

For Docker deployment:

```bash
docker-compose up -d
```

## License

This project is proprietary software. All rights reserved.