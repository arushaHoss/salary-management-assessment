# Design Decisions & Trade-offs

## 1. Soft Delete vs Hard Delete
**Decision:** Soft delete (isActive = false)
**Why:** HR teams need audit history. An employee leaving 
doesn't mean their record should vanish.
**Trade-off:** Queries must always filter isActive = true. 
We handle this in the service layer consistently.

## 2. Chunked Seed vs Single bulkCreate
**Decision:** Insert 10,000 rows in chunks of 500
**Why:** A single insert of 10k rows can hit PostgreSQL 
parameter limits. Chunking keeps memory usage flat.
**Trade-off:** Slightly more complex seed code, but 
significantly more reliable.

## 3. Pagination on Employee List
**Decision:** Default page size of 50
**Why:** Returning all 10,000 employees at once would 
crash the browser and hammer the DB.
**Trade-off:** Frontend needs pagination controls, 
but this is standard UX anyway.

## 4. Salary Stored as DECIMAL not INTEGER
**Decision:** DECIMAL(12, 2)
**Why:** Avoids floating point rounding errors when 
calculating averages across thousands of records.
**Trade-off:** Slightly more storage, negligible at this scale.