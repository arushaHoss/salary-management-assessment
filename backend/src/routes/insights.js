// backend/src/routes/insights.js
const express = require('express');
const InsightController = require('../controllers/insightController');

const router = express.Router();

// Routes
router.get('/organization', InsightController.getOrganizationStats);
router.get('/countries', InsightController.getAllCountries);
router.get('/departments', InsightController.getDepartmentSalaries);
router.get('/top-earners', InsightController.getTopEarners);
router.get('/salary-distribution', InsightController.getSalaryDistribution);
router.get('/country/:country/job-title/:jobTitle', InsightController.getJobTitleSalaries);
router.get('/country/:country', InsightController.getCountrySalaries);

module.exports = router;
