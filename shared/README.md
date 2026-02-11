# @event-booking/shared

Shared package containing **types** and **enums** used by the API and frontend.

## Structure

```
shared/
├── enums/
│   ├── event-status.enum.ts
│   ├── reservation-status.enum.ts
│   ├── user-role.enum.ts
│   └── index.ts
├── types/
│   ├── event.types.ts
│   ├── reservation.types.ts
│   ├── user.types.ts
│   ├── ticket.types.ts
│   ├── ui.types.ts
│   └── index.ts
├── index.ts
└── package.json
```

## Enums

| Enum | Values |
|------|--------|
| `EventStatus` | DRAFT, PUBLISHED, CANCELED |
| `ReservationStatus` | PENDING, CONFIRMED, REFUSED, CANCELED |
| `UserRole` | ADMIN, PARTICIPANT |

## Types

- **event.types** – IEvent, IEventCreate, IEventUpdate, IPaginatedEvents, etc.
- **reservation.types** – IReservation, IReservationWithDetails, ReservationFilters
- **user.types** – IUser, IUserCreate, IUserUpdate, LoginData
- **ticket.types** – ITicketData
- **ui.types** – ClickSparkProps, CurvedLoopProps, BounceCardsProps

## Usage

### In API (`apps/api`)

Path alias `@shared/*` → `../../shared/*` (tsconfig.json)

```ts
import { UserRole, EventStatus } from '../common/enums/user-role.enum.js';
import type { ITicketData } from '../../../../shared/types/index.js';
```

### In Web (`apps/web`)

Path alias `@shared/*` via `src/types/index.ts` which re-exports everything:

```ts
import { UserRole, EventStatus } from '@/types';
import type { IEvent } from '@/types';
```

## Note

This package has no separate build. The `.ts` files are compiled with the apps (api or web). Imports use `.js` extensions for ESM/Node compatibility.
