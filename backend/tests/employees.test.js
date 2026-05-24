// backend/tests/employees.test.js
/**
 * Comprehensive test suite for Employee management
 * Tests cover CRUD operations, search, filtering, and validation
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
  fullName: 'Alice Johnson',
  email: `alice_${Date.now()}_${Math.random()}@test.com`,
  jobTitle: 'Engineer',
  department: 'Engineering',
  country: 'USA',
  salary: 95000,
  currency: 'USD',
  employmentType: 'Full-time',
  hireDate: '2022-01-15',
  ...overrides
});

// ────────────────────────────────────────────────────────────
// CREATE - POST /api/employees
// ────────────────────────────────────────────────────────────

describe('POST /api/employees - Create Employee', () => {
  test('should create employee with all fields', async () => {
    const res = await request(app)
      .post('/api/employees')
      .send(makeEmployee());

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.fullName).toBe('Alice Johnson');
    expect(res.body.email).toBeDefined();
    expect(res.body.salary).toBe(95000);
    expect(res.body.isActive).toBe(true);
  });

  test('should reject duplicate email', async () => {
    const employee = makeEmployee({ email: 'duplicate@test.com' });
    await request(app).post('/api/employees').send(employee);
    
    const res = await request(app)
      .post('/api/employees')
      .send(employee);

    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  test('should reject invalid email', async () => {
    const res = await request(app)
      .post('/api/employees')
      .send(makeEmployee({ email: 'not-an-email' }));

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Validation Error');
  });

  test('should reject negative salary', async () => {
    const res = await request(app)
      .post('/api/employees')
      .send(makeEmployee({ salary: -1000 }));

    expect(res.statusCode).toBe(400);
  });

  test('should reject missing required fields', async () => {
    const res = await request(app)
      .post('/api/employees')
      .send({ fullName: 'Incomplete' });

    expect(res.statusCode).toBe(400);
  });

  test('should reject invalid employment type', async () => {
    const res = await request(app)
      .post('/api/employees')
      .send(makeEmployee({ employmentType: 'Invalid-Type' }));

    expect(res.statusCode).toBe(400);
  });

  test('should enforce name length constraints', async () => {
    const res = await request(app)
      .post('/api/employees')
      .send(makeEmployee({ fullName: 'A' }));

    expect(res.statusCode).toBe(400);
  });
});

// ────────────────────────────────────────────────────────────
// READ - GET /api/employees
// ────────────────────────────────────────────────────────────

describe('GET /api/employees - Retrieve Employees', () => {
  test('should return paginated list', async () => {
    await Employee.bulkCreate([
      makeEmployee({ email: 'a@test.com' }),
      makeEmployee({ email: 'b@test.com' }),
      makeEmployee({ email: 'c@test.com' })
    ]);

    const res = await request(app).get('/api/employees?page=1&limit=2');

    expect(res.statusCode).toBe(200);
    expect(res.body.employees.length).toBe(2);
    expect(res.body.total).toBe(3);
    expect(res.body.totalPages).toBe(2);
  });

  test('should return empty list when no employees', async () => {
    const res = await request(app).get('/api/employees');

    expect(res.statusCode).toBe(200);
    expect(res.body.employees.length).toBe(0);
    expect(res.body.total).toBe(0);
  });

  test('should return all fields for each employee', async () => {
    await Employee.create(makeEmployee());

    const res = await request(app).get('/api/employees');
    const emp = res.body.employees[0];

    expect(emp).toHaveProperty('id');
    expect(emp).toHaveProperty('fullName');
    expect(emp).toHaveProperty('email');
    expect(emp).toHaveProperty('jobTitle');
    expect(emp).toHaveProperty('department');
    expect(emp).toHaveProperty('country');
    expect(emp).toHaveProperty('salary');
    expect(emp).toHaveProperty('isActive');
  });

  test('should default to page 1', async () => {
    await Employee.create(makeEmployee({ email: 'a@test.com' }));

    const res = await request(app).get('/api/employees');

    expect(res.body.page).toBe(1);
  });

  test('should respect limit parameter', async () => {
    await Employee.bulkCreate([
      makeEmployee({ email: 'a@test.com' }),
      makeEmployee({ email: 'b@test.com' }),
      makeEmployee({ email: 'c@test.com' }),
      makeEmployee({ email: 'd@test.com' })
    ]);

    const res = await request(app).get('/api/employees?limit=2');

    expect(res.body.employees.length).toBe(2);
  });
});

// ────────────────────────────────────────────────────────────
// READ - GET /api/employees/:id
// ────────────────────────────────────────────────────────────

describe('GET /api/employees/:id - Get Single Employee', () => {
  test('should return employee by ID', async () => {
    const emp = await Employee.create(makeEmployee());

    const res = await request(app).get(`/api/employees/${emp.id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(emp.id);
    expect(res.body.fullName).toBe('Alice Johnson');
  });

  test('should return 404 for non-existent employee', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app).get(`/api/employees/${fakeId}`);

    expect(res.statusCode).toBe(404);
  });
});

// ────────────────────────────────────────────────────────────
// SEARCH - GET /api/employees/search
// ────────────────────────────────────────────────────────────

describe('GET /api/employees/search - Search Employees', () => {
  beforeEach(async () => {
    await Employee.bulkCreate([
      makeEmployee({ email: 'alice@test.com', fullName: 'Alice Johnson', country: 'USA', jobTitle: 'Engineer' }),
      makeEmployee({ email: 'bob@test.com', fullName: 'Bob Smith', country: 'UK', jobTitle: 'Manager' }),
      makeEmployee({ email: 'charlie@test.com', fullName: 'Charlie Brown', country: 'USA', jobTitle: 'Engineer' })
    ]);
  });

  test('should filter by country', async () => {
    const res = await request(app).get('/api/employees/search?country=USA');

    expect(res.statusCode).toBe(200);
    expect(res.body.employees.length).toBe(2);
    expect(res.body.employees.every(e => e.country === 'USA')).toBe(true);
  });

  test('should filter by job title', async () => {
    const res = await request(app).get('/api/employees/search?jobTitle=Engineer');

    expect(res.statusCode).toBe(200);
    expect(res.body.employees.length).toBe(2);
    expect(res.body.employees.every(e => e.jobTitle === 'Engineer')).toBe(true);
  });

  test('should search by name (case-insensitive)', async () => {
    const res = await request(app).get('/api/employees/search?search=alice');

    expect(res.statusCode).toBe(200);
    expect(res.body.employees.length).toBe(1);
    expect(res.body.employees[0].fullName).toBe('Alice Johnson');
  });

  test('should combine multiple filters', async () => {
    const res = await request(app).get('/api/employees/search?country=USA&jobTitle=Engineer');

    expect(res.statusCode).toBe(200);
    expect(res.body.employees.length).toBe(2);
    expect(res.body.employees.every(e => e.country === 'USA' && e.jobTitle === 'Engineer')).toBe(true);
  });

  test('should return empty when no matches', async () => {
    const res = await request(app).get('/api/employees/search?country=Japan');

    expect(res.statusCode).toBe(200);
    expect(res.body.employees.length).toBe(0);
  });
});

// ────────────────────────────────────────────────────────────
// UPDATE - PUT /api/employees/:id
// ────────────────────────────────────────────────────────────

describe('PUT /api/employees/:id - Update Employee', () => {
  let emp;

  beforeEach(async () => {
    emp = await Employee.create(makeEmployee());
  });

  test('should update employee salary', async () => {
    const res = await request(app)
      .put(`/api/employees/${emp.id}`)
      .send({ salary: 120000 });

    expect(res.statusCode).toBe(200);
    expect(res.body.salary).toBe(120000);
  });

  test('should update job title', async () => {
    const res = await request(app)
      .put(`/api/employees/${emp.id}`)
      .send({ jobTitle: 'Senior Engineer' });

    expect(res.statusCode).toBe(200);
    expect(res.body.jobTitle).toBe('Senior Engineer');
  });

  test('should reject invalid salary', async () => {
    const res = await request(app)
      .put(`/api/employees/${emp.id}`)
      .send({ salary: -5000 });

    expect(res.statusCode).toBe(400);
  });

  test('should return 404 for non-existent employee', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app)
      .put(`/api/employees/${fakeId}`)
      .send({ salary: 100000 });

    expect(res.statusCode).toBe(404);
  });

  test('should preserve other fields when updating', async () => {
    await request(app)
      .put(`/api/employees/${emp.id}`)
      .send({ salary: 120000 });

    const res = await request(app).get(`/api/employees/${emp.id}`);

    expect(res.body.fullName).toBe('Alice Johnson');
    expect(res.body.department).toBe('Engineering');
  });
});

// ────────────────────────────────────────────────────────────
// DELETE - DELETE /api/employees/:id
// ────────────────────────────────────────────────────────────

describe('DELETE /api/employees/:id - Delete Employee', () => {
  let emp;

  beforeEach(async () => {
    emp = await Employee.create(makeEmployee());
  });

  test('should soft-delete employee', async () => {
    const res = await request(app).delete(`/api/employees/${emp.id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Employee deleted successfully');
  });

  test('should not return deleted employee in list', async () => {
    await request(app).delete(`/api/employees/${emp.id}`);
    const res = await request(app).get('/api/employees');

    expect(res.body.employees.length).toBe(0);
  });

  test('should still keep record (soft delete)', async () => {
    await request(app).delete(`/api/employees/${emp.id}`);
    const deleted = await Employee.findByPk(emp.id);

    expect(deleted).toBeDefined();
    expect(deleted.isActive).toBe(false);
  });

  test('should return 404 when deleting non-existent employee', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app).delete(`/api/employees/${fakeId}`);

    expect(res.statusCode).toBe(404);
  });
});

// ────────────────────────────────────────────────────────────
// STATS - GET /api/employees/stats/count
// ────────────────────────────────────────────────────────────

describe('GET /api/employees/stats/count - Employee Count', () => {
  test('should return total active employee count', async () => {
    await Employee.bulkCreate([
      makeEmployee({ email: 'a@test.com' }),
      makeEmployee({ email: 'b@test.com' }),
      makeEmployee({ email: 'c@test.com' })
    ]);

    const res = await request(app).get('/api/employees/stats/count');

    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBe(3);
  });

  test('should exclude soft-deleted employees', async () => {
    const emp = await Employee.create(makeEmployee());
    await request(app).delete(`/api/employees/${emp.id}`);

    const res = await request(app).get('/api/employees/stats/count');

    expect(res.body.count).toBe(0);
  });
});

// ────────────────────────────────────────────────────────────
// Health Check
// ────────────────────────────────────────────────────────────

describe('GET /api/health - Health Check', () => {
  test('should return ok status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});