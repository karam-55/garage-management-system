# Garage Go Backend API

Node.js + TypeScript REST API for garage management system.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Customer, garage owner, mechanic, and admin roles
- **Garage Management**: Create and manage garages with mechanics
- **Booking System**: Schedule and manage service appointments
- **Vehicle Management**: Track customer vehicles and service history
- **Service Catalog**: Manage garage services and pricing
- **Inventory Management**: Track parts and supplies
- **Maintenance Records**: Detailed service history and notes
- **Notifications**: Real-time updates and email notifications
- **Reporting**: Analytics and business reports
- **Real-time Updates**: Socket.IO for live booking status

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT
- **Real-time**: Socket.IO
- **Validation**: Joi
- **File Upload**: Multer
- **Email**: Nodemailer
- **Documentation**: OpenAPI/Swagger ready

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose (optional)

### Installation

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up database:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   npx prisma db seed
   ```

### Development

```bash
# Start development server
npm run dev

# Start with Docker Compose
docker-compose up --build

# View database
npm run db:studio

# Run tests
npm test

# Build for production
npm run build
```

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/garage_go"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=5242880

# CORS
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication

All protected endpoints require a Bearer token:
```
Authorization: Bearer <jwt-token>
```

### Main Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user profile

#### Garages
- `GET /garages` - List all garages
- `POST /garages` - Create new garage (owner/admin)
- `GET /garages/:id` - Get garage details
- `PUT /garages/:id` - Update garage (owner/admin)
- `DELETE /garages/:id` - Delete garage (owner/admin)

#### Bookings
- `POST /bookings` - Create new booking
- `GET /bookings` - List bookings (filtered by role)
- `GET /bookings/:id` - Get booking details
- `PUT /bookings/:id` - Update booking
- `PUT /bookings/:id/confirm` - Confirm booking
- `PUT /bookings/:id/start` - Start service
- `PUT /bookings/:id/complete` - Complete service

#### Vehicles
- `POST /vehicles` - Add vehicle
- `GET /vehicles` - List user vehicles
- `GET /vehicles/:id` - Get vehicle details
- `PUT /vehicles/:id` - Update vehicle
- `DELETE /vehicles/:id` - Delete vehicle

#### Services
- `POST /services` - Create service (owner/mechanic)
- `GET /services` - List services
- `GET /services/:id` - Get service details
- `PUT /services/:id` - Update service
- `DELETE /services/:id` - Delete service

#### Inventory
- `POST /inventory` - Add inventory item
- `GET /inventory` - List inventory
- `GET /inventory/:id` - Get item details
- `PUT /inventory/:id` - Update item
- `PUT /inventory/:id/stock/add` - Add stock
- `PUT /inventory/:id/stock/remove` - Remove stock

#### Notifications
- `GET /notifications` - List user notifications
- `PUT /notifications/:id/read` - Mark as read
- `PUT /notifications/read-all` - Mark all as read
- `DELETE /notifications/:id` - Delete notification

#### Reports
- `GET /reports/daily` - Daily reports
- `GET /reports/garage/:id` - Garage reports
- `GET /reports/export/garage/:id` - Export garage data

## User Roles

- **CUSTOMER**: Can book services, manage vehicles, view own data
- **OWNER**: Can manage garages, services, inventory, view garage reports
- **MECHANIC**: Can view garage bookings, create maintenance records
- **ADMIN**: Full system access, user management, all reports

## Real-time Events

Connect to WebSocket for live updates:

```javascript
const socket = io('http://localhost:3000');

// Join garage room
socket.emit('join-garage', 'garage-id');

// Listen for events
socket.on('booking-created', (data) => {
  console.log('New booking:', data);
});

socket.on('booking-updated', (data) => {
  console.log('Booking updated:', data);
});
```

## Database Schema

The application uses Prisma with the following main models:

- **User**: Authentication and user management
- **Garage**: Garage information and ownership
- **Vehicle**: Customer vehicles
- **Service**: Garage services and pricing
- **Booking**: Appointment scheduling
- **Invoice**: Billing and payments
- **MaintenanceRecord**: Service history
- **PartsInventory**: Parts and supplies tracking
- **Notification**: User notifications

See `prisma/schema.prisma` for complete schema.

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Deployment

### Docker

```bash
# Build image
docker build -t garage-go-api .

# Run with Docker Compose
docker-compose up -d
```

### Production

1. Set production environment variables
2. Build the application: `npm run build`
3. Run with PM2 or similar process manager
4. Set up reverse proxy (nginx/Apache)
5. Configure SSL certificate
6. Set up monitoring and logging

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
