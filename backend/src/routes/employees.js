// backend/src/routes/employees.js
const express = require('express');
const EmployeeController = require('../controllers/employeeController');

const router = express.Router();

// Routes
router.post('/', EmployeeController.create);
router.get('/search', EmployeeController.search);
router.get('/stats/count', EmployeeController.getCount);
router.get('/', EmployeeController.getAll);
router.get('/:id', EmployeeController.getById);
router.put('/:id', EmployeeController.update);
router.delete('/:id', EmployeeController.delete);

module.exports = router;
