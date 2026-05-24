// backend/seeders/seed.js
/**
 * Seed script to generate and insert 10,000 employees
 * Run with: node seeders/seed.js
 *
 * Performance optimizations:
 * - Chunked inserts (500 at a time) to avoid hitting parameter limits
 * - Memory-efficient generation (no storing all 10k in memory at once)
 * - Realistic data: random job titles, departments, countries
 * - Progress logging for transparency
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Employee, sequelize, syncDatabase } = require('../src/models');

// Data pools
const FIRST_NAMES = fs.readFileSync(
  path.join(__dirname, 'first_names.txt'),
  'utf-8'
).split('\n').filter(name => name.trim());

const LAST_NAMES = fs.readFileSync(
  path.join(__dirname, 'last_names.txt'),
  'utf-8'
).split('\n').filter(name => name.trim());

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

/**
 * Generate random salary based on job title and country
 */
function generateSalary(jobTitle, country) {
  // Base salary by country (rough cost of living adjustment)
  const countryMultiplier = {
    USA: 1.0,
    Canada: 0.95,
    UK: 0.9,
    Germany: 0.85,
    France: 0.8,
    India: 0.2,
    Australia: 0.95,
    Japan: 0.9,
    Brazil: 0.3,
    Mexico: 0.3,
    Singapore: 1.1,
    Netherlands: 0.9
  };

  // Base salary by job title
  const titleBase = {
    'Software Engineer': 100000,
    'Product Manager': 120000,
    'Data Scientist': 110000,
    'DevOps Engineer': 105000,
    'UX Designer': 90000,
    'QA Engineer': 80000,
    'Solutions Architect': 130000,
    'Systems Administrator': 85000,
    'Business Analyst': 95000,
    'Technical Writer': 70000,
    'Project Manager': 100000,
    'Security Engineer': 115000,
    'Network Engineer': 95000,
    'Database Administrator': 100000,
    'Frontend Developer': 95000,
    'Backend Developer': 105000,
    'Full Stack Developer': 110000,
    'ML Engineer': 130000,
    'Cloud Architect': 140000,
    'IT Manager': 110000
  };

  const base = titleBase[jobTitle] || 80000;
  const countryMult = countryMultiplier[country] || 1.0;
  
  // Add random variance (±15%)
  const variance = (Math.random() - 0.5) * 0.3;
  const salary = Math.round(base * countryMult * (1 + variance));
  
  return Math.max(30000, salary); // Minimum salary floor
}

/**
 * Generate single employee object
 */
function generateEmployee(index) {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const jobTitle = JOB_TITLES[Math.floor(Math.random() * JOB_TITLES.length)];
  const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];

  return {
    fullName: `${firstName} ${lastName}`,
    email: `emp${index}@company.com`,
    jobTitle,
    department: DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)],
    country,
    salary: generateSalary(jobTitle, country),
    currency: 'USD',
    employmentType: EMPLOYMENT_TYPES[Math.floor(Math.random() * EMPLOYMENT_TYPES.length)],
    hireDate: new Date(2018 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
      .toISOString()
      .split('T')[0],
    isActive: true
  };
}

/**
 * Main seed function
 */
async function seed() {
  const CHUNK_SIZE = 500;
  const TOTAL_EMPLOYEES = 10000;
  let inserted = 0;
  let startTime = Date.now();

  try {
    console.log('🌱 Starting database seed...');
    
    // Sync database
    await syncDatabase();

    // Check if already seeded
    const existingCount = await Employee.count();
    if (existingCount > 0) {
      console.log(`⚠️  Database already has ${existingCount} employees. Skipping seed.`);
      console.log('   To reseed, delete employees from the database first.');
      return;
    }

    console.log(`📊 Generating and inserting ${TOTAL_EMPLOYEES} employees in chunks of ${CHUNK_SIZE}...`);

    // Insert in chunks
    for (let i = 0; i < TOTAL_EMPLOYEES; i += CHUNK_SIZE) {
      const chunk = [];
      const chunkEnd = Math.min(i + CHUNK_SIZE, TOTAL_EMPLOYEES);

      // Generate chunk
      for (let j = i; j < chunkEnd; j++) {
        chunk.push(generateEmployee(j + 1));
      }

      // Insert chunk
      await Employee.bulkCreate(chunk, { validate: false });
      inserted = chunkEnd;

      // Progress logging
      const percent = Math.round((inserted / TOTAL_EMPLOYEES) * 100);
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const rate = Math.round(inserted / (elapsed || 1));
      console.log(`  ✓ ${inserted}/${TOTAL_EMPLOYEES} (${percent}%) - ${rate} emp/sec`);
    }

    const totalTime = Math.round((Date.now() - startTime) / 1000);
    console.log(`\n✅ Seed complete!`);
    console.log(`   Inserted: ${inserted} employees in ${totalTime}s`);
    console.log(`   Rate: ${Math.round(inserted / totalTime)} employees/second`);

  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run
seed();
