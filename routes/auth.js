const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../src/controllers/authController');
const auth = require('../middleware/auth');

// Register a new user
router.post(
    '/register',
    [
        check('username', 'Username is required').not().isEmpty(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
        check('role', 'Role must be employee or manager').isIn(['employee', 'manager']),
    ],
    authController.register
);

// Login user
router.post(
    '/login',
    [
        check('username', 'Username is required').not().isEmpty(),
        check('password', 'Password is required').exists(),
    ],
    authController.login
);

// Get all employees (for assigning requests)
router.get('/employees', auth, authController.getEmployees);

module.exports = router;
