// backend/seeders/seed.js
/**
 * Seed script to generate and insert 10,000 employees
 * Run with: node seeders/seed.js
 *
 * Performance optimizations:
 * - Chunked inserts (500 at a time) to avoid hitting PostgreSQL parameter limits
 *   (13 columns × 500 rows = 6,500 params, well under the 65,535 limit)
 * - ignoreDuplicates: true skips rows where email already exists — safe to re-run
 * - Realistic salaries adjusted by job title and country multiplier
 * - Progress logging with rate (employees/sec) for visibility
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Employee, sequelize, syncDatabase } = require('../src/models');

// ─── Data Pools ───────────────────────────────────────────────────────────────

const FIRST_NAMES = fs.readFileSync(
  path.join(__dirname, 'first_names.txt'),
  'utf-8'
).split('\n').map(n => n.trim()).filter(Boolean);

const LAST_NAMES = fs.readFileSync(
  path.join(__dirname, 'last_names.txt'),
  'utf-8'
).split('\n').map(n => n.trim()).filter(Boolean);

const JOB_TITLES = [
  'Software Engineer',
  'Product Manager',
  'Data Scientist',
  'DevOps Engineer',
  'UX Designer',
  'QA Engineer',
  'Solutions Architect',
  'Systems Administrator',
  'Business Analyst',
  'Technical Writer',
  'Project Manager',
  'Security Engineer',
  'Network Engineer',
  'Database Administrator',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'ML Engineer',
  'Cloud Architect',
  'IT Manager'
];

const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Sales',
  'Marketing',
  'Finance',
  'HR',
  'Operations',
  'Legal',
  'Customer Support',
  'Data',
  'Infrastructure',
  'Security'
];

const COUNTRIES = [
  'USA',
  'Canada',
  'UK',
  'Germany',
  'France',
  'India',
  'Australia',
  'Japan',
  'Brazil',
  'Mexico',
  'Singapore',
  'Netherlands'
];

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract'];

// ─── Salary Generator ─────────────────────────────────────────────────────────

// Rough cost-of-living multiplier per country relative to USA baseline
const COUNTRY_MULTIPLIER = {
  USA: 1.0, Canada: 0.95, UK: 0.9, Germany: 0.85,
  France: 0.8, India: 0.2, Australia: 0.95, Japan: 0.9,
  Brazil: 0.3, Mexico: 0.3, Singapore: 1.1, Netherlands: 0.9
};

// Base USD salary per job title
const TITLE_BASE_SALARY = {
  'Software Engineer': 100000,   'Product Manager': 120000,
  'Data Scientist': 110000,      'DevOps Engineer': 105000,
  'UX Designer': 90000,          'QA Engineer': 80000,
  'Solutions Architect': 130000, 'Systems Administrator': 85000,
  'Business Analyst': 95000,     'Technical Writer': 70000,
  'Project Manager': 100000,     'Security Engineer': 115000,
  'Network Engineer': 95000,     'Database Administrator': 100000,
  'Frontend Developer': 95000,   'Backend Developer': 105000,
  'Full Stack Developer': 110000,'ML Engineer': 130000,
  'Cloud Architect': 140000,     'IT Manager': 110000
};

function generateSalary(jobTitle, country) {
  const base = TITLE_BASE_SALARY[jobTitle] || 80000;
  const countryMult = COUNTRY_MULTIPLIER[country] || 1.0;
  const variance = (Math.random() - 0.5) * 0.3; // ±15% random variance
  return Math.max(30000, Math.round(base * countryMult * (1 + variance)));
}

// ─── Employee Generator ───────────────────────────────────────────────────────

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

function generateEmployee(index) {
  const jobTitle = pick(JOB_TITLES);
  const country  = pick(COUNTRIES);

  // Hire date randomly between 2018 and 2024
  const hireDate = new Date(
    2018 + Math.floor(Math.random() * 6),
    Math.floor(Math.random() * 12),
    Math.floor(Math.random() * 28) + 1
  ).toISOString().split('T')[0];

  return {
    fullName:       `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    email:          `emp${index}@company.com`,   // index-based → guaranteed unique
    jobTitle,
    department:     pick(DEPARTMENTS),
    country,
    salary:         generateSalary(jobTitle, country),
    currency:       'USD',
    employmentType: pick(EMPLOYMENT_TYPES),
    hireDate,
    isActive:       true
  };
}

// ─── Main Seed Function ───────────────────────────────────────────────────────

async function seed() {
  const CHUNK_SIZE      = 500;
  const TOTAL_EMPLOYEES = 10000;
  const startTime       = Date.now();
  let   totalInserted   = 0;
  let   totalSkipped    = 0;

  try {
    console.log('🌱 Starting database seed...');
    await syncDatabase();

    const existingCount = await Employee.count();
    console.log(`ℹ️  Existing employees in DB: ${existingCount}`);
    console.log(`📊 Attempting to insert ${TOTAL_EMPLOYEES} employees in chunks of ${CHUNK_SIZE}...`);
    console.log(`   Duplicates (same email) will be skipped automatically.\n`);

    for (let i = 0; i < TOTAL_EMPLOYEES; i += CHUNK_SIZE) {
      const chunkEnd = Math.min(i + CHUNK_SIZE, TOTAL_EMPLOYEES);

      // Build chunk in memory
      const chunk = Array.from(
        { length: chunkEnd - i },
        (_, j) => generateEmployee(i + j + 1)
      );

      // bulkCreate with ignoreDuplicates:
      // - Rows whose email already exists are silently skipped
      // - No error thrown, no transaction rollback
      // - Returns only the rows that were actually inserted
      const inserted = await Employee.bulkCreate(chunk, {
        validate:         false,   // skip per-row validation for speed
        ignoreDuplicates: true     // ON CONFLICT DO NOTHING
      });

      const chunkInserted = inserted.length;
      const chunkSkipped  = chunk.length - chunkInserted;
      totalInserted      += chunkInserted;
      totalSkipped       += chunkSkipped;

      // Progress
      const processed = chunkEnd;
      const percent   = Math.round((processed / TOTAL_EMPLOYEES) * 100);
      const elapsed   = (Date.now() - startTime) / 1000 || 1;
      const rate      = Math.round(processed / elapsed);
      console.log(
        `  ✓ ${processed}/${TOTAL_EMPLOYEES} (${percent}%)` +
        ` | inserted: ${chunkInserted}` +
        ` | skipped: ${chunkSkipped}` +
        ` | ${rate} emp/sec`
      );
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Seed complete!`);
    console.log(`   Inserted : ${totalInserted}`);
    console.log(`   Skipped  : ${totalSkipped} (already existed)`);
    console.log(`   Time     : ${totalTime}s`);
    console.log(`   Rate     : ${Math.round(totalInserted / totalTime)} employees/second`);

  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seed();