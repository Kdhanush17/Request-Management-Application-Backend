const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const requestController = require('../src/controllers/requestController');

const authorize = (roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden: You do not have the necessary permissions' });
    }
    next();
};

// Create a new request (Employee A)
router.post(
    '/',
    [
        auth,
        authorize(['employee']),
        check('title', 'Title is required').not().isEmpty(),
        check('description', 'Description is required').not().isEmpty(),
        check('assigned_to', 'Assigned to employee ID is required and must be an integer').isInt(),
    ],
    requestController.createRequest
);

// Get all requests (for employees, shows requests created by them or assigned to them; for managers, shows all)
router.get('/', auth, requestController.getRequests);

// Get a single request
router.get('/:id', auth, requestController.getRequestById);

// Manager approves/rejects a request
router.put(
    '/:id/approve',
    [
        auth,
        authorize(['manager']),
        check('status', 'Status must be approved or rejected').isIn(['approved', 'rejected']),
    ],
    requestController.approveRejectRequest
);

// Employee (B) actions a request
router.put('/:id/action', auth, authorize(['employee']), requestController.actionRequest);

// Employee (B) closes a request
router.put('/:id/close', auth, authorize(['employee']), requestController.closeRequest);

// Get dashboard counts
router.get('/dashboard-counts', auth, requestController.getDashboardCounts);

module.exports = router;
