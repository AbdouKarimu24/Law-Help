# Cameroon Legal Assistant Application

A comprehensive legal assistance platform connecting Cameroonians with legal resources and qualified lawyers.

## Features

- AI-powered legal assistance for common legal questions
- Lawyer directory with ratings and reviews
- Lawyer application and profile management
- User authentication with email/SMS 2FA
- Dark/light theme support
- Search history tracking
- Responsive design for all devices

## Getting Started

### Prerequisites

- Node.js 18 or higher
- XAMPP (for local development)
- Docker (for production deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cameroon-legal-assistant.git
cd cameroon-legal-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
- Start XAMPP
- Create a new database named `lawhelp`
- Import the database schema from `database/schema.sql`

4. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=lawhelp
JWT_SECRET=your_secret_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMS_PROVIDER_API_KEY=your-sms-api-key
VITE_AI_MODEL_ENDPOINT=http://localhost:5000/predict
```

5. Start the development server:
```bash
npm run dev
```

### Default Login Credentials

- Email: abdou@gmail.com
- Password: abdou1

## AI Model Integration

The application uses a custom AI model for legal assistance. To integrate your trained model:

1. Place your model files in the `ai-model` directory:
```
ai-model/
  ├── models/          # Trained model files
  ├── src/            # Model serving code
  ├── requirements.txt # Python dependencies
  └── Dockerfile      # Container configuration
```

2. Update the model endpoint in `.env`:
```
VITE_AI_MODEL_ENDPOINT=http://localhost:5000/predict
```

3. Build and run the Docker containers:
```bash
docker-compose up -d
```

## Two-Factor Authentication

### Email 2FA Setup

1. Configure SMTP settings in `.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
```

2. For Gmail:
- Enable 2-Step Verification in your Google Account
- Generate an App Password for the application
- Use the App Password in SMTP_PASS

### SMS 2FA Setup

1. Configure SMS provider in `.env`:
```
SMS_PROVIDER_API_KEY=your-sms-api-key
```

2. Update SMS service configuration in `services/auth/src/config/sms.js`

## Architecture

The application follows a microservices architecture with the following services:

- Frontend (React + TypeScript)
- Auth Service (with 2FA support)
- User Service
- Lawyer Service
- Chat Service (with AI model integration)
- Rating Service
- History Service

Each service is containerized using Docker and can be deployed independently.

For detailed architecture information, see [ARCHITECTURE.md](ARCHITECTURE.md).

## API Documentation

### Authentication

```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/verify-2fa
POST /api/auth/logout
```

### Lawyers

```
GET /api/lawyers
GET /api/lawyers/:id
POST /api/lawyers/apply
PUT /api/lawyers/:id
POST /api/lawyers/:id/rate
```

### Users

```
GET /api/users/profile
PUT /api/users/profile
PUT /api/users/password
PUT /api/users/2fa
```

### Chat

```
POST /api/chat/send
GET /api/chat/history
```

## Docker Deployment

1. Build the images:
```bash
docker-compose build
```

2. Start the services:
```bash
docker-compose up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

