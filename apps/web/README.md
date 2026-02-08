# Event Booking Web

Next.js 16 frontend for the event booking application.

## Tech Stack

- **Next.js** 16 (App Router)
- **React** 19
- **Tailwind CSS**
- **Radix UI** (components)
- **Axios** (API client)

## Installation

```bash
npm install
```

## Running

```bash
# Development (webpack - required for shared package)
npm run dev

# Production
npm run build
npm run start
```

> **Note:** The `dev` script uses `--webpack` to resolve imports from the `shared` package.  
> Use `npm run dev:turbo` for Turbopack (if shared package is compatible).

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev with webpack |
| `npm run dev:turbo` | Dev with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm test` | Jest |
| `npm run lint` | ESLint |

## Structure

```
src/
├── app/                    # App Router
│   ├── (landing)/         # Home page
│   ├── dashboard/         # Admin & Participant
│   │   ├── admin/
│   │   └── participant/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── auth/              # Login, Register, ProtectedRoute
│   ├── events/            # Admin & Participant events
│   ├── reservations/
│   ├── users/
│   ├── home/              # Hero, Events, About
│   ├── layout/            # Navbar, Sidebar, Footer
│   └── ui/                # UI components (button, input, etc.)
├── lib/
│   ├── api/               # API clients (auth, events, reservations, users)
│   ├── context/           # AuthContext
│   ├── hooks/             # useAuth
│   └── utils.ts
└── types/                 # Re-exports @shared
```

## Roles and Routes

| Role | Dashboard | Access |
|------|-----------|--------|
| Admin | `/dashboard/admin` | Events, Reservations, Users |
| Participant | `/dashboard/participant` | Events, My reservations |
