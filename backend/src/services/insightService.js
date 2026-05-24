// backend/src/services/insightService.js
const { Employee } = require('../models');
const { sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * All business logic for salary insights
 */
class InsightService {
  /**
   * Get salary statistics for a specific country
   */
  static async getSalaryByCountry(country) {
    const stats = await Employee.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('MIN', sequelize.col('salary')), 'minSalary'],
        [sequelize.fn('MAX', sequelize.col('salary')), 'maxSalary'],
        [sequelize.fn('AVG', sequelize.col('salary')), 'avgSalary']
      ],
      where: { country, isActive: true },
      raw: true
    });

    const headcount = parseInt(stats?.count || 0);

    if (!stats || headcount === 0) {
      return null;
    }

    return {
      country,
      headcount,
      minSalary: parseFloat(stats.minSalary),
      maxSalary: parseFloat(stats.maxSalary),
      avgSalary: parseFloat(stats.avgSalary)
    };
  }

  /**
   * Get average salary for a job title in a specific country
   */
  static async getJobTitleSalaryByCountry(country, jobTitle) {
    const stats = await Employee.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('MIN', sequelize.col('salary')), 'minSalary'],
        [sequelize.fn('MAX', sequelize.col('salary')), 'maxSalary'],
        [sequelize.fn('AVG', sequelize.col('salary')), 'avgSalary']
      ],
      where: { country, jobTitle, isActive: true },
      raw: true
    });

    const headcount = parseInt(stats?.count || 0);

    if (!stats || headcount === 0) {
      return null;
    }

    return {
      country,
      jobTitle,
      headcount,
      minSalary: parseFloat(stats.minSalary),
      maxSalary: parseFloat(stats.maxSalary),
      avgSalary: parseFloat(stats.avgSalary)
    };
  }

  /**
   * Get all countries with salary statistics
   */
  static async getAllCountriesSalaries() {
    const stats = await Employee.findAll({
      attributes: [
        'country',
        [sequelize.fn('COUNT', sequelize.col('id')), 'headcount'],
        [sequelize.fn('MIN', sequelize.col('salary')), 'minSalary'],
        [sequelize.fn('MAX', sequelize.col('salary')), 'maxSalary'],
        [sequelize.fn('AVG', sequelize.col('salary')), 'avgSalary']
      ],
      where: { isActive: true },
      group: ['country'],
      raw: true,
      order: [[sequelize.col('avgSalary'), 'DESC']]
    });

    return stats.map(s => ({
      country: s.country,
      headcount: parseInt(s.headcount),
      minSalary: parseFloat(s.minSalary),
      maxSalary: parseFloat(s.maxSalary),
      avgSalary: parseFloat(s.avgSalary)
    }));
  }

  /**
   * Get salary statistics by department
   */
  static async getSalaryByDepartment(country = null) {
    const where = { isActive: true };
    if (country) where.country = country;

    const stats = await Employee.findAll({
      attributes: [
        'department',
        [sequelize.fn('COUNT', sequelize.col('id')), 'headcount'],
        [sequelize.fn('AVG', sequelize.col('salary')), 'avgSalary']
      ],
      where,
      group: ['department'],
      raw: true,
      order: [[sequelize.col('avgSalary'), 'DESC']]
    });

    return stats.map(s => ({
      department: s.department,
      headcount: parseInt(s.headcount),
      avgSalary: parseFloat(s.avgSalary)
    }));
  }

  /**
   * Get top earners (highest salaries)
   */
  static async getTopEarners(limit = 10, country = null) {
    const where = { isActive: true };
    if (country) where.country = country;

    const employees = await Employee.findAll({
      where,
      order: [['salary', 'DESC']],
      limit,
      attributes: ['id', 'fullName', 'jobTitle', 'department', 'country', 'salary']
    });

    return employees.map(employee => employee.toJSON());
  }

  /**
   * Get salary distribution (headcount by salary ranges)
   */
  static async getSalaryDistribution(country = null) {
    const where = { isActive: true };
    if (country) where.country = country;

    const stats = await Employee.findAll({
      attributes: [
        [sequelize.literal("CASE WHEN salary < 50000 THEN '<50k' WHEN salary < 100000 THEN '50-100k' WHEN salary < 150000 THEN '100-150k' ELSE '>150k' END"), 'range'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where,
      group: [sequelize.literal("CASE WHEN salary < 50000 THEN '<50k' WHEN salary < 100000 THEN '50-100k' WHEN salary < 150000 THEN '100-150k' ELSE '>150k' END")],
      raw: true
    });

    const ranges = ['<50k', '50-100k', '100-150k', '>150k'];
    const distribution = {};

    ranges.forEach(range => {
      const found = stats.find(s => s.range === range);
      distribution[range] = found ? parseInt(found.count) : 0;
    });

    return distribution;
  }

  /**
   * Get overall organization statistics
   */
  static async getOrganizationStats() {
    const totalEmployees = await Employee.count({ where: { isActive: true } });

    const salaryStats = await Employee.findOne({
      attributes: [
        [sequelize.fn('MIN', sequelize.col('salary')), 'minSalary'],
        [sequelize.fn('MAX', sequelize.col('salary')), 'maxSalary'],
        [sequelize.fn('AVG', sequelize.col('salary')), 'avgSalary']
      ],
      where: { isActive: true },
      raw: true
    });

    const countries = await sequelize.query(
      'SELECT COUNT(DISTINCT country) as count FROM employees WHERE "isActive" = true',
      { type: sequelize.QueryTypes.SELECT }
    );

    const departments = await sequelize.query(
      'SELECT COUNT(DISTINCT department) as count FROM employees WHERE "isActive" = true',
      { type: sequelize.QueryTypes.SELECT }
    );

    return {
      totalEmployees,
      countries: parseInt(countries[0].count),
      departments: parseInt(departments[0].count),
      minSalary: parseFloat(salaryStats.minSalary),
      maxSalary: parseFloat(salaryStats.maxSalary),
      avgSalary: parseFloat(salaryStats.avgSalary)
    };
  }
}

module.exports = InsightService;
