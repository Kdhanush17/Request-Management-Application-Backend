const { validationResult } = require('express-validator');
const requestService = require('../services/requestService');

const createRequest = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, assigned_to } = req.body;
    const created_by = req.user.id;
    try {
        const newRequest = await requestService.createRequest(title, description, created_by, assigned_to);
        res.status(201).json(newRequest);
    } catch (err) {
        next(err);
    }
};

const getRequests = async (req, res, next) => {
    const { role, id } = req.user;
    try {
        const requests = await requestService.getRequests(role, id);
        res.json(requests);
    } catch (err) {
        next(err);
    }
};

const getRequestById = async (req, res, next) => {
    const requestId = parseInt(req.params.id);
    if (isNaN(requestId)) {
        return res.status(400).json({ message: 'Invalid request ID provided.' });
    }
    const { role, id: userId } = req.user;
    try {
        const request = await requestService.getRequestById(requestId, role, userId);
        res.json(request);
    } catch (err) {
        next(err);
    }
};

const approveRejectRequest = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;
    const manager_id = req.user.id;
    try {
        const updatedRequest = await requestService.approveRejectRequest(parseInt(id), status, manager_id);
        res.json(updatedRequest);
    } catch (err) {
        next(err);
    }
};

const actionRequest = async (req, res, next) => {
    const { id } = req.params;
    const employee_id = req.user.id;
    try {
        const updatedRequest = await requestService.actionRequest(parseInt(id), employee_id);
        res.json(updatedRequest);
    } catch (err) {
        next(err);
    }
};

const closeRequest = async (req, res, next) => {
    const { id } = req.params;
    const employee_id = req.user.id;
    try {
        const updatedRequest = await requestService.closeRequest(parseInt(id), employee_id);
        res.json(updatedRequest);
    } catch (err) {
        next(err);
    }
};
const getDashboardCounts = async (req, res, next) => {
    console.log("res",req.user)
    const { role, id } = req.user;
    const userId = parseInt(id); // Ensure userId is an integer
    
    if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID.' });
    }

    try {
        const counts = await requestService.getDashboardCounts(role, userId);
        res.json(counts);
    } catch (err) {
        next(err);
    }
};


module.exports = {
    createRequest,
    getRequests,
    getRequestById,
    approveRejectRequest,
    actionRequest,
    closeRequest,
    getDashboardCounts,
};
