// backend/src/services/employeeService.js
const { Employee } = require('../models');
const { Op } = require('sequelize');

/**
 * All business logic for employee operations
 */
class EmployeeService {
  /**
   * Create a new employee
   */
  static async createEmployee(data) {
    return await Employee.create(data);
  }

  /**
   * Get all active employees with pagination
   */
  static async getAllEmployees(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Employee.findAndCountAll({
      where: { isActive: true },
      offset,
      limit,
      order: [['createdAt', 'DESC']]
    });

    return {
      total: count,
      page,
      pageSize: limit,
      totalPages: Math.ceil(count / limit),
      employees: rows
    };
  }

  /**
   * Get single employee by ID
   */
  static async getEmployeeById(id) {
    const employee = await Employee.findByPk(id);
    if (!employee || !employee.isActive) {
      const error = new Error('Employee not found');
      error.statusCode = 404;
      throw error;
    }
    return employee;
  }

  /**
   * Update an employee
   */
  static async updateEmployee(id, data) {
    const employee = await this.getEmployeeById(id);
    return await employee.update(data);
  }

  /**
   * Soft delete an employee
   */
  static async deleteEmployee(id) {
    const employee = await this.getEmployeeById(id);
    return await employee.update({ isActive: false });
  }

  /**
   * Get employee count
   */
  static async getTotalEmployeeCount() {
    return await Employee.count({ where: { isActive: true } });
  }

  /**
   * Search employees by various criteria
   */
  static async searchEmployees(filters, page = 1, limit = 50) {
    const where = { isActive: true };

    if (filters.country) where.country = filters.country;
    if (filters.jobTitle) where.jobTitle = filters.jobTitle;
    if (filters.department) where.department = filters.department;
    if (filters.search) {
      where[Op.or] = [
        { fullName: { [Op.iLike]: `%${filters.search}%` } },
        { email: { [Op.iLike]: `%${filters.search}%` } }
      ];
    }

    const offset = (page - 1) * limit;
    const { count, rows } = await Employee.findAndCountAll({
      where,
      offset,
      limit,
      order: [['createdAt', 'DESC']]
    });

    return {
      total: count,
      page,
      pageSize: limit,
      totalPages: Math.ceil(count / limit),
      employees: rows
    };
  }
}

module.exports = EmployeeService;
