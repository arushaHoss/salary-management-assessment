// frontend/src/api/client.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Employee Endpoints ────────────────────────────────────

export const employeeApi = {
  /**
   * Get all employees with pagination
   */
  getAll: (page = 1, limit = 50) =>
    client.get('/employees', { params: { page, limit } }),

  /**
   * Search/filter employees
   */
  search: (filters, page = 1, limit = 50) =>
    client.get('/employees/search', { params: { ...filters, page, limit } }),

  /**
   * Get single employee by ID
   */
  getById: (id) => client.get(`/employees/${id}`),

  /**
   * Create new employee
   */
  create: (data) => client.post('/employees', data),

  /**
   * Update employee
   */
  update: (id, data) => client.put(`/employees/${id}`, data),

  /**
   * Delete (soft delete) employee
   */
  delete: (id) => client.delete(`/employees/${id}`),

  /**
   * Get total employee count
   */
  getCount: () => client.get('/employees/stats/count'),
};

// ─── Insight Endpoints ─────────────────────────────────────

export const insightApi = {
  /**
   * Get salary stats for a country
   */
  getCountrySalaries: (country) =>
    client.get(`/insights/country/${country}`),

  /**
   * Get salary stats for job title in a country
   */
  getJobTitleSalaries: (country, jobTitle) =>
    client.get(`/insights/country/${country}/job-title/${jobTitle}`),

  /**
   * Get stats for all countries
   */
  getAllCountries: () => client.get('/insights/countries'),

  /**
   * Get department salary stats
   */
  getDepartments: (country = null) =>
    client.get('/insights/departments', { params: country ? { country } : {} }),

  /**
   * Get top earners
   */
  getTopEarners: (limit = 10, country = null) =>
    client.get('/insights/top-earners', { params: { limit, ...(country ? { country } : {}) } }),

  /**
   * Get salary distribution by ranges
   */
  getSalaryDistribution: (country = null) =>
    client.get('/insights/salary-distribution', { params: country ? { country } : {} }),

  /**
   * Get organization-wide statistics
   */
  getOrganizationStats: () => client.get('/insights/organization'),
};

export default client;
