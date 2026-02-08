# Event Booking API Documentation

Base URL: `http://localhost:{PORT}/api`

**Swagger UI:** `http://localhost:{PORT}/api/docs` – Interactive API documentation

All authenticated requests must include the JWT token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

---

## Authentication

### POST `/auth/register`
Register a new user. **Public** (no auth required).

**Request body:**
```json
{
  "email": "string (valid email)",
  "password": "string (min 8 chars, 1 uppercase, 1 lowercase, 1 number)",
  "firstName": "string (min 2 chars)",
  "lastName": "string (min 2 chars)",
  "role": "ADMIN | PARTICIPANT (optional, defaults to PARTICIPANT)"
}
```

**Response:** `{ access_token, user: { id, email, firstName, lastName, role } }`

---

### POST `/auth/login`
Login and get JWT token. **Public** (no auth required).

**Request body:**
```json
{
  "email": "string (valid email)",
  "password": "string (min 8 chars)"
}
```

**Response:** `{ access_token, user: { id, email, firstName, lastName, role } }`

---

### GET `/auth/profile`
Get current user profile. **Requires JWT.**

**Response:** `{ user: { id, email, firstName, lastName, role } }`

---

## Events

### POST `/events`
Create a new event. **Admin only.**

**Request body:**
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "date": "string (ISO 8601 date)",
  "time": "string (required)",
  "location": "string (required)",
  "capacity": "number (min 1)",
  "price": "number (min 0)",
  "status": "DRAFT | PUBLISHED | CANCELED (optional)",
  "bg": "string (required, background image)"
}
```

---

### GET `/events`
List events with pagination and filters. **Public.**

**Query params:**
| Param      | Type   | Description                                  |
|------------|--------|----------------------------------------------|
| page       | number | Page number (default: 1)                     |
| limit      | number | Items per page (default: 10)                 |
| status     | string | Filter: DRAFT, PUBLISHED, CANCELED           |
| search     | string | Search in title/description                  |
| minPrice   | number | Minimum price                                |
| maxPrice   | number | Maximum price                                |
| date       | string | Filter by date                               |
| time       | string | Filter by time                               |

**Response:** `{ events, total, page, limit, totalPages }`

---

### GET `/events/:id`
Get a single event by ID. **Public.**

---

### PATCH `/events/:id/status`
Update event status. **Admin only.**

**Request body:**
```json
{
  "status": "DRAFT | PUBLISHED | CANCELED"
}
```

---

### PATCH `/events/:id`
Update an event. **Admin only.** (Partial update: send only fields to change)

**Request body:** Same fields as CreateEventDto (all optional for PATCH)

---

### DELETE `/events/:id`
Delete an event. **Admin only.**

---

## Reservations

### POST `/reservations`
Create a reservation. **Requires JWT** (authenticated user).

**Request body:**
```json
{
  "eventId": "string (MongoDB ObjectId)"
}
```

---

### GET `/reservations`
List reservations. **Requires JWT.**

- **Admin:** Returns all reservations with optional filters
- **Participant:** Returns only own reservations

**Query params (Admin only):**
| Param      | Type   | Description                               |
|------------|--------|-------------------------------------------|
| eventTitle | string | Filter by event title                     |
| userName   | string | Filter by user name                       |
| status     | string | PENDING, CONFIRMED, REFUSED, CANCELED     |

---

### GET `/reservations/:id`
Get a single reservation. **Requires JWT.**

---

### GET `/reservations/:id/ticket`
Download ticket PDF. **Requires JWT.**  
Only for CONFIRMED reservations. User can only download their own ticket.

**Response:** PDF file (application/pdf)

---

### PATCH `/reservations/:id`
Update a reservation (general fields). **Requires JWT.**

**Request body:** Partial CreateReservationDto

---

### PATCH `/reservations/:id/status`
Update reservation status. **Admin only.**

**Request body:**
```json
{
  "status": "PENDING | CONFIRMED | REFUSED | CANCELED"
}
```

---

### PATCH `/reservations/:id/cancel`
Participant cancels own reservation. **Requires JWT.**  
Cancellation allowed only if event starts in at least 24 hours.

---

### DELETE `/reservations/:id`
Delete a reservation. **Requires JWT.**

---

## Users

All user endpoints require **Admin** role.

### POST `/users`
Create a new user.

**Request body:**
```json
{
  "email": "string (valid email)",
  "password": "string (min 8 chars)",
  "firstName": "string (min 2 chars)",
  "lastName": "string (min 2 chars)",
  "role": "ADMIN | PARTICIPANT (optional)"
}
```

---

### GET `/users`
List all users. **Admin only.**

---

### GET `/users/:id`
Get a single user by ID. **Admin only.**

---

### PATCH `/users/:id`
Update a user. **Admin only.** (Partial update)

**Request body:** Same fields as CreateUserDto (all optional)

---

### DELETE `/users/:id`
Delete a user. **Admin only.**

---

## Enums Reference

### EventStatus
| Value     | Description |
|-----------|-------------|
| DRAFT     | Not visible to participants |
| PUBLISHED | Visible and bookable       |
| CANCELED  | Event canceled             |

### ReservationStatus
| Value    | Description              |
|----------|--------------------------|
| PENDING  | Awaiting admin approval  |
| CONFIRMED| Approved, ticket ready   |
| REFUSED  | Rejected by admin        |
| CANCELED | Canceled by participant  |

### UserRole
| Value      | Description        |
|------------|--------------------|
| ADMIN      | Full access        |
| PARTICIPANT| Events & own reservations |

---

## Error Responses

- **400 Bad Request** – Validation errors or invalid input
- **401 Unauthorized** – Missing or invalid JWT
- **403 Forbidden** – Insufficient permissions
- **404 Not Found** – Resource not found
