# Finance Dashboard Backend

A REST API backend for a finance dashboard system, built with **Node.js**, **Express**, and **MongoDB**. Supports financial record management, role-based access control, and dashboard-level analytics.

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Auth**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit

---

## Project Structure

```
src/
├── config/
│   └── db.js               # MongoDB connection
├── controllers/
│   ├── authController.js   # Register, login, profile
│   ├── userController.js   # Admin user management
│   ├── recordController.js # Financial record CRUD
│   └── dashboardController.js # Aggregated analytics
├── middleware/
│   ├── auth.js             # JWT verification + role authorization
│   ├── errorHandler.js     # Centralized error formatting
│   └── validate.js         # express-validator result handler
├── models/
│   ├── User.js             # User schema with roles
│   └── Record.js           # Financial record schema
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── recordRoutes.js
│   └── dashboardRoutes.js
├── validators/
│   ├── authValidators.js
│   ├── recordValidators.js
│   └── userValidators.js
├── app.js                  # Express app setup
└── server.js               # Entry point
```

---

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd finance-backend
npm install
```

### 2. Configure environment


Create `.env` with your MongoDB URI and a secure JWT secret:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/finance_dashboard
JWT_SECRET=replace_this_with_a_long_random_string
JWT_EXPIRES_IN=7d
```


### 3. Start the server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

---

## Roles and Permissions

| Action                        | Viewer | Analyst | Admin |
|-------------------------------|--------|---------|-------|
| View financial records        | ✅     | ✅      | ✅    |
| Create/update records         | ❌     | ✅      | ✅    |
| Delete records                | ❌     | ❌      | ✅    |
| Access dashboard analytics    | ❌     | ✅      | ✅    |
| Manage users (list/edit)      | ❌     | ❌      | ✅    |
| Change own password           | ✅     | ✅      | ✅    |

---

## API Reference

All protected endpoints require the header:
```
Authorization: Bearer <your_jwt_token>
```

---

### Auth

#### Register
```
POST /api/auth/register
```
Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "viewer"
}
```

#### Login
```
POST /api/auth/login
```
Body:
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```
Returns a JWT token to use in subsequent requests.

#### Get current user
```
GET /api/auth/me
```

---

### Users (Admin only)

| Method | Endpoint              | Description                  |
|--------|-----------------------|------------------------------|
| GET    | /api/users            | List all users (filterable)  |
| GET    | /api/users/:id        | Get a specific user          |
| PATCH  | /api/users/:id        | Update name, role, or status |
| DELETE | /api/users/:id        | Delete a user                |
| PATCH  | /api/users/me/password| Change your own password     |

**Query params for GET /api/users:**
- `role` — filter by role (viewer, analyst, admin)
- `isActive` — filter by status (true/false)
- `page`, `limit` — pagination

---

### Financial Records

| Method | Endpoint         | Who can access        |
|--------|------------------|-----------------------|
| GET    | /api/records     | All authenticated     |
| GET    | /api/records/:id | All authenticated     |
| POST   | /api/records     | Analyst, Admin        |
| PATCH  | /api/records/:id | Analyst, Admin        |
| DELETE | /api/records/:id | Admin only            |

**Query params for GET /api/records:**
- `type` — income or expense
- `category` — salary, rent, food, etc.
- `startDate` / `endDate` — ISO 8601 date range
- `sortBy` — field to sort by (default: date)
- `order` — asc or desc (default: desc)
- `page`, `limit` — pagination

**Record body fields:**
```json
{
  "amount": 1500.00,
  "type": "income",
  "category": "salary",
  "date": "2024-03-15",
  "description": "March salary payment"
}
```

**Valid categories:** salary, freelance, investment, rent, utilities, food, transport, healthcare, entertainment, education, taxes, other

---

### Dashboard Analytics (Analyst and Admin)

| Method | Endpoint                      | Description                          |
|--------|-------------------------------|--------------------------------------|
| GET    | /api/dashboard/summary        | Total income, expenses, net balance  |
| GET    | /api/dashboard/by-category    | Totals broken down by category       |
| GET    | /api/dashboard/monthly-trends | Month-by-month breakdown for a year  |
| GET    | /api/dashboard/weekly-trends  | Last 8 weeks of activity             |
| GET    | /api/dashboard/recent         | Recent transactions (feed)           |

**Query params:**
- `startDate` / `endDate` — filter summary and category endpoints by date range
- `type` — filter by-category by income or expense
- `year` — specify year for monthly trends (default: current year)
- `limit` — number of records for recent activity (max 50)

**Example summary response:**
```json
{
  "success": true,
  "summary": {
    "income": 45000,
    "expense": 18500,
    "incomeCount": 12,
    "expenseCount": 34,
    "netBalance": 26500
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Descriptive error message here."
}
```

Validation errors include a field-level breakdown:

```json
{
  "success": false,
  "message": "Validation failed. Please check your input.",
  "errors": [
    { "field": "amount", "message": "Amount must be a positive number" },
    { "field": "category", "message": "Category is required" }
  ]
}
```

**HTTP status codes used:**
- `200` — OK
- `201` — Created
- `400` — Bad request / validation error
- `401` — Unauthenticated
- `403` — Forbidden (wrong role)
- `404` — Not found
- `409` — Conflict (e.g. duplicate email)
- `429` — Rate limit exceeded
- `500` — Internal server error

---

## Design Decisions and Tradeoffs

**Soft delete vs hard delete**: Records and users are hard-deleted for simplicity. In production, soft deletes (adding a `deletedAt` field) would be safer for audit trails. The `isActive` flag on users serves a similar purpose for account management.

**Role model**: Three roles cover the common dashboard use case cleanly. If the system needed more granular permissions (e.g., per-department or per-record ownership), a proper RBAC or ABAC system with a permissions collection would be the next step.

**Rate limiting**: A global 100 req/15min limit is applied. A production system would likely want tighter limits on auth endpoints specifically to prevent brute-force attacks.

**Category enum**: Categories are enforced as an enum on the schema to keep data consistent for aggregations. If the product needed user-defined categories, a separate Category collection would be appropriate.

**JWT over sessions**: Stateless JWTs suit a dashboard API well. There's no token blacklisting on logout — for that, you'd need a Redis-based token deny list or switch to short-lived tokens with refresh tokens.
