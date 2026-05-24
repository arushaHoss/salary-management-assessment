# Entity Relationship Diagram

## Employees Table

| Column          | Type           | Constraints              |
|-----------------|----------------|--------------------------|
| id              | UUID           | PRIMARY KEY              |
| fullName        | VARCHAR(255)   | NOT NULL                 |
| email           | VARCHAR(255)   | NOT NULL, UNIQUE         |
| jobTitle        | VARCHAR(100)   | NOT NULL                 |
| department      | VARCHAR(100)   | NOT NULL                 |
| country         | VARCHAR(100)   | NOT NULL                 |
| salary          | DECIMAL(12,2)  | NOT NULL                 |
| currency        | VARCHAR(3)     | DEFAULT 'USD'            |
| employmentType  | ENUM           | Full-time/Part-time/Contract |
| hireDate        | DATEONLY       | NOT NULL                 |
| isActive        | BOOLEAN        | DEFAULT true             |
| createdAt       | TIMESTAMP      | AUTO                     |
| updatedAt       | TIMESTAMP      | AUTO                     |

## Indexes
- country         → speeds up insights queries filtered by country
- jobTitle        → speeds up job title aggregation queries
- department      → speeds up headcount by department
- isActive        → speeds up filtering out inactive employees

## Why one table?
At 10,000 employees the data is straightforward enough that 
a single well-indexed table outperforms joins. If requirements 
grew (e.g. salary history, org hierarchy), we'd add tables then.