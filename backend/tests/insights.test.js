// backend/tests/insights.test.js
/**
 * Comprehensive test suite for Salary Insights
 * Tests cover all insight endpoints and calculations
 */

const request = require('supertest');
const app = require('../src/app');
const { Employee, syncDatabase, sequelize } = require('../src/models');

// ─── Setup/Teardown ────────────────────────────────────────
beforeAll(async () => {
  await syncDatabase();
});

beforeEach(async () => {
  await Employee.destroy({ where: {}, truncate: true, cascade: true });
});

afterAll(async () => {
  await sequelize.close();
});

// ─── Test Helper ───────────────────────────────────────────
const makeEmployee = (overrides = {}) => ({
  fullName: 'Test Employee',
  email: `emp_${Date.now()}_${Math.random()}@test.com`,
  jobTitle: 'Engineer',
  department: 'Engineering',
  country: 'USA',
  salary: 100000,
  currency: 'USD',
  employmentType: 'Full-time',
  hireDate: '2022-01-15',
  ...overrides
});

// ────────────────────────────────────────────────────────────
// GET /api/insights/country/:country
// ────────────────────────────────────────────────────────────

describe('GET /api/insights/country/:country - Country Salary Statistics', () => {
  beforeEach(async () => {
    await Employee.bulkCreate([
      makeEmployee({ country: 'USA', salary: 80000 }),
      makeEmployee({ country: 'USA', salary: 100000 }),
      makeEmployee({ country: 'USA', salary: 120000 }),
      makeEmployee({ country: 'UK', salary: 70000 })
    ]);
  });

  test('should return salary stats for country', async () => {
    const res = await request(app).get('/api/insights/country/USA');

    expect(res.statusCode).toBe(200);
    expect(res.body.country).toBe('USA');
    expect(res.body.headcount).toBe(3);
    expect(res.body.minSalary).toBe(80000);
    expect(res.body.maxSalary).toBe(120000);
    expect(res.body.avgSalary).toBeCloseTo(100000, 0);
  });

  test('should return 404 for non-existent country', async () => {
    const res = await request(app).get('/api/insights/country/Atlantis');

    expect(res.statusCode).toBe(404);
  });

  test('should exclude inactive employees', async () => {
    const emp = await Employee.findOne({ where: { country: 'USA' } });
    await emp.update({ isActive: false });

    const res = await request(app).get('/api/insights/country/USA');

    expect(res.body.headcount).toBe(2);
  });
});

// ────────────────────────────────────────────────────────────
// GET /api/insights/country/:country/job-title/:jobTitle
// ────────────────────────────────────────────────────────────

describe('GET /api/insights/country/:country/job-title/:jobTitle', () => {
  beforeEach(async () => {
    await Employee.bulkCreate([
      makeEmployee({ country: 'USA', jobTitle: 'Engineer', salary: 100000 }),
      makeEmployee({ country: 'USA', jobTitle: 'Engineer', salary: 110000 }),
      makeEmployee({ country: 'USA', jobTitle: 'Manager', salary: 120000 }),
      makeEmployee({ country: 'UK', jobTitle: 'Engineer', salary: 90000 })
    ]);
  });

  test('should return salary stats for job title in country', async () => {
    const res = await request(app).get('/api/insights/country/USA/job-title/Engineer');

    expect(res.statusCode).toBe(200);
    expect(res.body.country).toBe('USA');
    expect(res.body.jobTitle).toBe('Engineer');
    expect(res.body.headcount).toBe(2);
    expect(res.body.minSalary).toBe(100000);
    expect(res.body.maxSalary).toBe(110000);
    expect(res.body.avgSalary).toBeCloseTo(105000, 0);
  });

  test('should return 404 when job title not found in country', async () => {
    const res = await request(app).get('/api/insights/country/USA/job-title/NonExistent');

    expect(res.statusCode).toBe(404);
  });
});

// ────────────────────────────────────────────────────────────
// GET /api/insights/countries
// ────────────────────────────────────────────────────────────

describe('GET /api/insights/countries - All Countries Statistics', () => {
  beforeEach(async () => {
    await Employee.bulkCreate([
      makeEmployee({ country: 'USA', salary: 100000 }),
      makeEmployee({ country: 'USA', salary: 120000 }),
      makeEmployee({ country: 'UK', salary: 80000 }),
      makeEmployee({ country: 'Germany', salary: 90000 })
    ]);
  });

  test('should return statistics for all countries', async () => {
    const res = await request(app).get('/api/insights/countries');

    expect(res.statusCode).toBe(200);
    expect(res.body.countries.length).toBe(3);
    expect(res.body.countries.some(c => c.country === 'USA')).toBe(true);
    expect(res.body.countries.some(c => c.country === 'UK')).toBe(true);
  });

  test('should order by average salary descending', async () => {
    const res = await request(app).get('/api/insights/countries');

    for (let i = 0; i < res.body.countries.length - 1; i++) {
      expect(res.body.countries[i].avgSalary).toBeGreaterThanOrEqual(res.body.countries[i + 1].avgSalary);
    }
  });

  test('should include correct statistics for each country', async () => {
    const res = await request(app).get('/api/insights/countries');
    const usa = res.body.countries.find(c => c.country === 'USA');

    expect(usa.headcount).toBe(2);
    expect(usa.minSalary).toBe(100000);
    expect(usa.maxSalary).toBe(120000);
  });
});

// ────────────────────────────────────────────────────────────
// GET /api/insights/departments
// ────────────────────────────────────────────────────────────

describe('GET /api/insights/departments - Department Statistics', () => {
  beforeEach(async () => {
    await Employee.bulkCreate([
      makeEmployee({ department: 'Engineering', salary: 100000 }),
      makeEmployee({ department: 'Engineering', salary: 110000 }),
      makeEmployee({ department: 'Sales', salary: 80000 }),
      makeEmployee({ department: 'Marketing', salary: 70000 })
    ]);
  });

  test('should return department statistics', async () => {
    const res = await request(app).get('/api/insights/departments');

    expect(res.statusCode).toBe(200);
    expect(res.body.departments.length).toBe(3);
  });

  test('should include headcount and average salary', async () => {
    const res = await request(app).get('/api/insights/departments');
    const eng = res.body.departments.find(d => d.department === 'Engineering');

    expect(eng.headcount).toBe(2);
    expect(eng.avgSalary).toBeCloseTo(105000, 0);
  });

  test('should filter by country when provided', async () => {
    await Employee.bulkCreate([
      makeEmployee({ country: 'UK', department: 'Engineering', salary: 90000 })
    ]);

    const res = await request(app).get('/api/insights/departments?country=UK');

    expect(res.body.departments.length).toBe(1);
    expect(res.body.departments[0].department).toBe('Engineering');
  });

  test('should order by average salary descending', async () => {
    const res = await request(app).get('/api/insights/departments');

    for (let i = 0; i < res.body.departments.length - 1; i++) {
      expect(res.body.departments[i].avgSalary).toBeGreaterThanOrEqual(res.body.departments[i + 1].avgSalary);
    }
  });
});

// ────────────────────────────────────────────────────────────
// GET /api/insights/top-earners
// ────────────────────────────────────────────────────────────

describe('GET /api/insights/top-earners - Highest Paid Employees', () => {
  beforeEach(async () => {
    await Employee.bulkCreate([
      makeEmployee({ fullName: 'Alice', salary: 150000 }),
      makeEmployee({ fullName: 'Bob', salary: 120000 }),
      makeEmployee({ fullName: 'Charlie', salary: 180000 }),
      makeEmployee({ fullName: 'David', salary: 100000 })
    ]);
  });

  test('should return top earners ordered by salary desc', async () => {
    const res = await request(app).get('/api/insights/top-earners');

    expect(res.statusCode).toBe(200);
    expect(res.body.topEarners.length).toBeGreaterThan(0);
    expect(res.body.topEarners[0].fullName).toBe('Charlie');
    expect(res.body.topEarners[0].salary).toBe(180000);
  });

  test('should respect limit parameter', async () => {
    const res = await request(app).get('/api/insights/top-earners?limit=2');

    expect(res.body.topEarners.length).toBe(2);
  });

  test('should default to limit 10', async () => {
    const res = await request(app).get('/api/insights/top-earners');

    expect(res.body.topEarners.length).toBeLessThanOrEqual(10);
  });

  test('should filter by country when provided', async () => {
    await Employee.bulkCreate([
      makeEmployee({ country: 'UK', fullName: 'Eve', salary: 200000 })
    ]);

    const res = await request(app).get('/api/insights/top-earners?country=UK');

    expect(res.body.topEarners[0].fullName).toBe('Eve');
    expect(res.body.topEarners[0].country).toBe('UK');
  });

  test('should include relevant employee fields', async () => {
    const res = await request(app).get('/api/insights/top-earners');

    const emp = res.body.topEarners[0];
    expect(emp).toHaveProperty('id');
    expect(emp).toHaveProperty('fullName');
    expect(emp).toHaveProperty('jobTitle');
    expect(emp).toHaveProperty('department');
    expect(emp).toHaveProperty('country');
    expect(emp).toHaveProperty('salary');
  });
});

// ────────────────────────────────────────────────────────────
// GET /api/insights/salary-distribution
// ────────────────────────────────────────────────────────────

describe('GET /api/insights/salary-distribution - Salary Ranges', () => {
  beforeEach(async () => {
    await Employee.bulkCreate([
      makeEmployee({ salary: 30000 }),   // < 50k
      makeEmployee({ salary: 40000 }),   // < 50k
      makeEmployee({ salary: 75000 }),   // 50-100k
      makeEmployee({ salary: 90000 }),   // 50-100k
      makeEmployee({ salary: 125000 }),  // 100-150k
      makeEmployee({ salary: 160000 })   // > 150k
    ]);
  });

  test('should return salary distribution', async () => {
    const res = await request(app).get('/api/insights/salary-distribution');

    expect(res.statusCode).toBe(200);
    expect(res.body.distribution).toHaveProperty('<50k');
    expect(res.body.distribution).toHaveProperty('50-100k');
    expect(res.body.distribution).toHaveProperty('100-150k');
    expect(res.body.distribution).toHaveProperty('>150k');
  });

  test('should count employees in correct ranges', async () => {
    const res = await request(app).get('/api/insights/salary-distribution');

    expect(res.body.distribution['<50k']).toBe(2);
    expect(res.body.distribution['50-100k']).toBe(2);
    expect(res.body.distribution['100-150k']).toBe(1);
    expect(res.body.distribution['>150k']).toBe(1);
  });

  test('should filter by country when provided', async () => {
    await Employee.bulkCreate([
      makeEmployee({ country: 'UK', salary: 35000 })
    ]);

    const res = await request(app).get('/api/insights/salary-distribution?country=UK');

    expect(res.body.distribution['<50k']).toBe(1);
  });
});

// ────────────────────────────────────────────────────────────
// GET /api/insights/organization
// ────────────────────────────────────────────────────────────

describe('GET /api/insights/organization - Organization Statistics', () => {
  beforeEach(async () => {
    await Employee.bulkCreate([
      makeEmployee({ country: 'USA', department: 'Engineering', salary: 100000 }),
      makeEmployee({ country: 'USA', department: 'Sales', salary: 80000 }),
      makeEmployee({ country: 'UK', department: 'Engineering', salary: 90000 })
    ]);
  });

  test('should return organization wide statistics', async () => {
    const res = await request(app).get('/api/insights/organization');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('totalEmployees');
    expect(res.body).toHaveProperty('countries');
    expect(res.body).toHaveProperty('departments');
    expect(res.body).toHaveProperty('minSalary');
    expect(res.body).toHaveProperty('maxSalary');
    expect(res.body).toHaveProperty('avgSalary');
  });

  test('should return correct statistics', async () => {
    const res = await request(app).get('/api/insights/organization');

    expect(res.body.totalEmployees).toBe(3);
    expect(res.body.countries).toBe(2);
    expect(res.body.departments).toBe(2);
    expect(res.body.minSalary).toBe(80000);
    expect(res.body.maxSalary).toBe(100000);
    expect(res.body.avgSalary).toBeCloseTo((100000 + 80000 + 90000) / 3, 0);
  });

  test('should exclude inactive employees', async () => {
    const emp = await Employee.findOne();
    await emp.update({ isActive: false });

    const res = await request(app).get('/api/insights/organization');

    expect(res.body.totalEmployees).toBe(2);
  });
});
