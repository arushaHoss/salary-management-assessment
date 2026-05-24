// backend/src/controllers/employeeController.js
const EmployeeService = require('../services/employeeService');

/**
 * Handles HTTP requests for employee operations
 * Delegates business logic to EmployeeService
 */
class EmployeeController {
  /**
   * POST /api/employees
   * Create a new employee
   */
  static async create(req, res, next) {
    try {
      const employee = await EmployeeService.createEmployee(req.body);
      res.status(201).json(employee);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/employees
   * Get all active employees with pagination
   */
  static async getAll(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const data = await EmployeeService.getAllEmployees(page, limit);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/employees/search
   * Search employees by filters
   */
  static async search(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const data = await EmployeeService.searchEmployees(req.query, page, limit);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/employees/:id
   * Get a single employee by ID
   */
  static async getById(req, res, next) {
    try {
      const employee = await EmployeeService.getEmployeeById(req.params.id);
      res.json(employee);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/employees/:id
   * Update an employee
   */
  static async update(req, res, next) {
    try {
      const employee = await EmployeeService.updateEmployee(req.params.id, req.body);
      res.json(employee);
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/employees/:id
   * Soft delete an employee
   */
  static async delete(req, res, next) {
    try {
      const employee = await EmployeeService.deleteEmployee(req.params.id);
      res.json({ message: 'Employee deleted successfully', employee });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/employees/stats/count
   * Get total active employee count
   */
  static async getCount(req, res, next) {
    try {
      const count = await EmployeeService.getTotalEmployeeCount();
      res.json({ count });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = EmployeeController;
