const { validationResult } = require('express-validator');
const authService = require('../services/authService');

const register = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, role } = req.body;
    try {
        const user = await authService.registerUser(username, password, role);
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (err) {
        next(err);
    }
};

const login = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    try {
        const { token, user } = await authService.loginUser(username, password);
        res.json({ token, user });
    } catch (err) {
        next(err);
    }
};

const getEmployees = async (req, res, next) => {
    try {
        const employees = await authService.getAllEmployees();
        res.json(employees);
    } catch (err) {
        next(err);
    }
};


module.exports = {
    register,
    login,
    getEmployees
};
