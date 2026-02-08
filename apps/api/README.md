# Event Booking API

NestJS backend for event, reservation, and user management.

## Tech Stack

- **NestJS** 11
- **MongoDB** (Mongoose)
- **JWT** (Passport)
- **Swagger** (OpenAPI)
- **class-validator** / **class-transformer**

## Installation

```bash
npm install
```

## Running

```bash
# Development (watch mode)
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Documentation

- **[docs/API.md](./docs/API.md)** – Endpoints list
- **Swagger UI** – http://localhost:3001/api/docs (when API is running)

## Environment Variables

Create an `.env` file at the root of `apps/api`:

```env
PORT=3001
MONGODB_URI=mongodb://...
JWT_SECRET=your-secret
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000
```

## Scripts

| Script               | Description          |
| -------------------- | -------------------- |
| `npm run start:dev`  | Dev with hot-reload  |
| `npm run build`      | Production build     |
| `npm run start:prod` | Run production build |
| `npm test`           | Unit tests           |
| `npm run test:e2e`   | E2E tests            |
| `npm run lint`       | ESLint               |
| `npm run seed:admin` | Create default admin |

## Structure

```
src/
├── auth/           # Authentication, register, login, JWT
├── events/         # Events CRUD
├── reservations/   # Reservations, ticket PDF
├── users/          # User management
├── tickets/        # PDF ticket generation
├── common/         # Decorators, enums, guards
├── seeds/          # Admin seed
├── main.ts
└── app.module.ts
```
