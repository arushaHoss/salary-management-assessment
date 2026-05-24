// backend/src/controllers/insightController.js
const InsightService = require('../services/insightService');

/**
 * Handles HTTP requests for salary insights
 * Delegates business logic to InsightService
 */
class InsightController {
  /**
   * GET /api/insights/country/:country
   * Get salary statistics for a specific country
   */
  static async getCountrySalaries(req, res, next) {
    try {
      const stats = await InsightService.getSalaryByCountry(req.params.country);
      if (!stats) {
        const err = new Error('No employees found for this country');
        err.statusCode = 404;
        throw err;
      }
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/insights/country/:country/job-title/:jobTitle
   * Get salary stats for a job title in a country
   */
  static async getJobTitleSalaries(req, res, next) {
    try {
      const stats = await InsightService.getJobTitleSalaryByCountry(
        req.params.country,
        req.params.jobTitle
      );
      if (!stats) {
        const err = new Error('No employees found for this job title and country combination');
        err.statusCode = 404;
        throw err;
      }
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/insights/countries
   * Get all countries with salary statistics
   */
  static async getAllCountries(req, res, next) {
    try {
      const stats = await InsightService.getAllCountriesSalaries();
      res.json({ countries: stats });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/insights/departments
   * Get salary statistics by department
   */
  static async getDepartmentSalaries(req, res, next) {
    try {
      const country = req.query.country || null;
      const stats = await InsightService.getSalaryByDepartment(country);
      res.json({ departments: stats });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/insights/top-earners
   * Get highest paid employees
   */
  static async getTopEarners(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const country = req.query.country || null;
      const employees = await InsightService.getTopEarners(limit, country);
      res.json({ topEarners: employees });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/insights/salary-distribution
   * Get headcount distribution by salary ranges
   */
  static async getSalaryDistribution(req, res, next) {
    try {
      const country = req.query.country || null;
      const distribution = await InsightService.getSalaryDistribution(country);
      res.json({ distribution });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/insights/organization
   * Get overall organization statistics
   */
  static async getOrganizationStats(req, res, next) {
    try {
      const stats = await InsightService.getOrganizationStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = InsightController;
