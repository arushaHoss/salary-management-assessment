# Architecture Overview

## Tech Stack
- **Backend:** Node.js + Express.js
- **ORM:** Sequelize
- **Database:** PostgreSQL
- **Frontend:** React.js + Vite
- **Charts:** Recharts
- **Testing:** Jest + Supertest (backend), Vitest + RTL (frontend)

## Why These Choices?

### Sequelize over raw SQL
Sequelize gives us model-level validations, easy migrations, and 
readable query syntax. For a team maintaining this long-term, this 
reduces bugs and makes the codebase approachable.

### PostgreSQL over SQLite
SQLite is fine for local dev but PostgreSQL handles concurrent 
requests better, supports proper ENUM types, and is what we'd 
use in production with 10,000 employees.

### Soft Delete over Hard Delete
Employees are never truly deleted — we set isActive = false.
HR teams often need to audit past employee records. Hard deletes 
make that impossible.

## Layer Structure
Request → Route → Controller → Service → Sequelize Model → DB

- **Routes:** only define URL + HTTP method, nothing else
- **Controllers:** handle req/res, call service, return response
- **Services:** all business logic lives here, no req/res knowledge
- **Models:** Sequelize schema + validations

This separation means services are easily unit testable without 
needing HTTP context.

## API Design
REST API with the following base routes:
- GET/POST        /api/employees
- GET/PUT/DELETE  /api/employees/:id
- GET             /api/insights/country/:country
- GET             /api/insights/country/:country/job-title/:title
- GET             /api/insights/top-paid
- GET             /api/insights/headcount-by-department

## Folder Structure
backend/
├── src/
│   ├── config/        → DB connection
│   ├── models/        → Sequelize models
│   ├── routes/        → Express routers
│   ├── controllers/   → req/res handlers
│   ├── services/      → business logic
│   └── middleware/    → error handling
├── seeders/           → seed script
└── tests/             → Jest test files

frontend/
├── src/
│   ├── api/           → all axios calls
│   ├── pages/         → full page components
│   └── components/    → reusable UI pieces