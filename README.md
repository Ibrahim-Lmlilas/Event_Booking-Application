# Event Booking Application

![CI/CD](https://github.com/Ibrahim-Lmlilas/Event_Booking-Application/actions/workflows/ci-cd.yml/badge.svg)

Web application for event and reservation management with role-based authentication (Admin / Participant).

## 📁 Project Structure

```
event-booking-app/
├── apps/
│   ├── api/          # NestJS Backend
│   └── web/          # Next.js Frontend
├── shared/           # Shared types & enums
├── .github/workflows/ # CI/CD
├── docker-compose.yml
└── docker-compose.dev.yml
```

| Directory | Description |
|-----------|-------------|
| [apps/api](./apps/api) | REST API, NestJS, MongoDB, JWT, Swagger |
| [apps/web](./apps/web) | Next.js interface, React, Tailwind |
| [shared](./shared) | TypeScript types and enums used by api and web |

## 🚀 Quick Start

### With Docker (recommended)

```bash
# Production
docker-compose up -d

# Development (hot-reload)
docker-compose -f docker-compose.dev.yml up -d
```

- **API:** http://localhost:3001/api  
- **Swagger:** http://localhost:3001/api/docs  
- **Web:** http://localhost:3000  

### Local Development

**Prerequisites:** Node.js 20+, MongoDB

```bash
# 1. Install dependencies
cd apps/api && npm install
cd ../web && npm install
cd ../../shared && npm install  # if needed

# 2. MongoDB (local or Docker)
# Set MONGODB_URI in apps/api/.env

# 3. Start API
cd apps/api && npm run start:dev

# 4. Start frontend
cd apps/web && npm run dev
```

## 🔧 Environment Variables

### API (`apps/api/.env`)

| Variable | Description |
|----------|-------------|
| PORT | API port (e.g. 3001) |
| MONGODB_URI | MongoDB URI |
| JWT_SECRET | JWT secret key |
| JWT_EXPIRES_IN | Token expiry (e.g. 24h) |
| CORS_ORIGIN | Allowed origin (e.g. http://localhost:3000) |

### Web (`apps/web/.env.local`)

| Variable | Description |
|----------|-------------|
| NEXT_PUBLIC_API_URL | API URL (e.g. http://localhost:3001/api) |

## 📚 Documentation

- [API Documentation](./apps/api/docs/API.md) – Endpoints list
- [Swagger UI](http://localhost:3001/api/docs) – Interactive API docs
- [CI/CD](./.github/workflows/README.md) – GitHub Actions pipeline

## 🧪 Tests

```bash
# API
cd apps/api && npm test

# Web
cd apps/web && npm test
```

## 📦 Scripts

```bash
# Lint (from root)
npm run lint

# Prettier format
npm run format
```

## 🔐 Roles

| Role | Access |
|------|--------|
| **Admin** | CRUD events, users, reservation management |
| **Participant** | View published events, reserve, cancel (per rules) |

## 🚀 Deploy Backend on Render

1. Push the repo to GitHub.
2. Go to [render.com](https://render.com) → **New** → **Web Service**.
3. Connect your GitHub repo.
4. Render will detect `render.yaml`; or set manually:
   - **Root Directory:** (leave empty)
   - **Build Command:** `cd apps/api && npm install && npm run build`
   - **Start Command:** `cd apps/api && npm run start:prod`
   - **Runtime:** Node 20
5. Add **Environment Variables:**
   - `MONGODB_URI` – MongoDB Atlas connection string
   - `JWT_SECRET` – strong random secret
   - `CORS_ORIGIN` – frontend URL (e.g. `https://your-app.vercel.app`)
   - `JWT_EXPIRES_IN` – `24h` (optional)
6. Deploy. API URL: `https://your-service.onrender.com/api`
