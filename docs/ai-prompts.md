# AI Usage Log

## Prompt 1 — Initial Planning
**Tool:** Claude (claude.ai)
**Prompt:**
"I have a job interview assessment to build a salary management 
tool for 10,000 employees. Backend: Node.js + Express. ORM: 
Sequelize. Frontend: React. Guide me step by step — how to build, 
how to write tests and how to deploy."

**What I took from it:** Overall project structure, tech stack 
decisions, commit history strategy, folder layout.
**What I changed/decided myself:** Chose SQLite for local dev 
over PostgreSQL to simplify setup. Adjusted folder names to 
match my personal conventions.

---

## Prompt 2 — Seed Script
**Tool:** Claude (claude.ai)
**Prompt:**
"What is seeding and how do I write a performant seed script 
for 10,000 employees using Sequelize?"

**What I took from it:** Learned about chunked bulkCreate to 
avoid PostgreSQL's parameter limit. Used CHUNK_SIZE = 500.
**What I verified myself:** Read Sequelize bulkCreate docs to 
confirm ignoreDuplicates option behavior.

---

## Honest Note
I used Claude heavily in the planning and architecture phase. 
My job during implementation was to:
- Understand every line of generated code before committing it
- Run and verify tests myself
- Make decisions where AI gave me options (e.g. soft delete 
  vs hard delete, defaultScope vs manual filtering)
- Catch when AI output was wrong or outdated