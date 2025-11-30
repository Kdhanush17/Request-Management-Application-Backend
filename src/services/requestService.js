const pool = require('../../config/db');
const authService = require('./authService');

const createRequest = async (title, description, created_by, assigned_to) => {
    if (created_by === assigned_to) {
        throw new Error('Cannot assign a request to yourself.');
    }

    const assignedUser = await authService.getUserWithManager(assigned_to);
    if (!assignedUser || assignedUser.role !== 'employee') {
        throw new Error('Assigned user does not exist or is not an employee.');
    }
    if (!assignedUser.manager_id) {
        throw new Error('Assigned employee does not have a manager.');
    }

    const newRequest = await pool.query(
        'INSERT INTO requests (title, description, created_by, assigned_to, assigned_to_manager_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [title, description, created_by, assigned_to, assignedUser.manager_id, 'pending_approval']
    );

    console.log(`Notification: Request "${title}" (ID: ${newRequest.rows[0].id}) created by ${created_by} and assigned to ${assigned_to}. Sent for approval to manager (ID: ${assignedUser.manager_id}).`);

    return newRequest.rows[0];
};

const getRequests = async (userRole, userId) => {
    let requests;
    if (userRole === 'manager') {
        // Manager sees requests where they are the assigned_to_manager_id or created by them
        requests = await pool.query(
            'SELECT r.*, u1.username as created_by_username, u2.username as assigned_to_username, m.username as assigned_to_manager_username FROM requests r JOIN users u1 ON r.created_by = u1.id JOIN users u2 ON r.assigned_to = u2.id LEFT JOIN users m ON r.assigned_to_manager_id = m.id WHERE r.assigned_to_manager_id = $1 OR r.created_by = $1 ORDER BY r.created_at DESC',
            [userId]
        );
    } else {
        // Employee sees requests created by them or assigned to them
        requests = await pool.query(
            'SELECT r.*, u1.username as created_by_username, u2.username as assigned_to_username, m.username as assigned_to_manager_username FROM requests r JOIN users u1 ON r.created_by = u1.id JOIN users u2 ON r.assigned_to = u2.id LEFT JOIN users m ON r.assigned_to_manager_id = m.id WHERE created_by = $1 OR assigned_to = $1 ORDER BY r.created_at DESC',
            [userId]
        );
    }
    return requests.rows;
};

const getRequestById = async (id, userRole, userId) => {
    const request = await pool.query(
        'SELECT r.*, u1.username as created_by_username, u2.username as assigned_to_username, m.username as assigned_to_manager_username FROM requests r JOIN users u1 ON r.created_by = u1.id JOIN users u2 ON r.assigned_to = u2.id LEFT JOIN users m ON r.assigned_to_manager_id = m.id WHERE r.id = $1',
        [id]
    );

    if (request.rows.length === 0) {
        throw new Error('Request not found');
    }

    // Authorization check
    if (userRole === 'employee' && userId !== request.rows[0].created_by && userId !== request.rows[0].assigned_to) {
        throw new Error('Forbidden: You do not have permission to view this request');
    }

    if (userRole === 'manager' && userId !== request.rows[0].assigned_to_manager_id && userId !== request.rows[0].created_by) {
        throw new Error('Forbidden: You do not have permission to view this request');
    }

    return request.rows[0];
};

const approveRejectRequest = async (requestId, status, manager_id) => {
    if (!['approved', 'rejected'].includes(status)) {
        throw new Error('Invalid status. Must be "approved" or "rejected".');
    }

    const request = await pool.query('SELECT * FROM requests WHERE id = $1', [requestId]);

    if (request.rows.length === 0) {
        throw new Error('Request not found');
    }

    if (request.rows[0].status !== 'pending_approval') {
        throw new Error(`Request is already ${request.rows[0].status}. Cannot ${status}.`);
    }

    if (request.rows[0].assigned_to_manager_id !== manager_id) {
        throw new Error('Forbidden: You are not the manager assigned to approve this request.');
    }

    const managerApproved = status === 'approved';
    const updatedRequest = await pool.query(
        'UPDATE requests SET status = $1, manager_approved = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
        [status, managerApproved, requestId]
    );

    await pool.query(
        'INSERT INTO approvals (request_id, manager_id, status) VALUES ($1, $2, $3)',
        [requestId, manager_id, status]
    );

    return updatedRequest.rows[0];
};

const actionRequest = async (requestId, employee_id) => {
    const request = await pool.query('SELECT * FROM requests WHERE id = $1', [requestId]);

    if (request.rows.length === 0) {
        throw new Error('Request not found');
    }

    if (request.rows[0].assigned_to !== employee_id) {
        throw new Error('Forbidden: You are not assigned to this request.');
    }

    if (!request.rows[0].manager_approved || request.rows[0].status !== 'approved') {
        throw new Error('Request must be approved by your manager before it can be actioned.');
    }

    const updatedRequest = await pool.query(
        'UPDATE requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        ['actioned', requestId]
    );

    return updatedRequest.rows[0];
};

const closeRequest = async (requestId, employee_id) => {
    const request = await pool.query('SELECT * FROM requests WHERE id = $1', [requestId]);

    if (request.rows.length === 0) {
        throw new Error('Request not found');
    }

    if (request.rows[0].assigned_to !== employee_id) {
        throw new Error('Forbidden: You are not assigned to this request.');
    }

    if (request.rows[0].status !== 'actioned') {
        throw new Error('Request must be actioned before it can be closed.');
    }

    const updatedRequest = await pool.query(
        'UPDATE requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        ['closed', requestId]
    );

    return updatedRequest.rows[0];
};

const getDashboardCounts = async (userRole, userId) => {
    let totalRequestsQuery;
    let pendingRequestsQuery;
    let completedRequestsQuery;

    if (userRole === 'manager') {
        // Manager sees requests where they are the assigned_to_manager_id or created by them
        totalRequestsQuery = 'SELECT COUNT(*) FROM requests WHERE assigned_to_manager_id = $1 OR created_by = $1';
        pendingRequestsQuery = 'SELECT COUNT(*) FROM requests WHERE (assigned_to_manager_id = $1 OR created_by = $1) AND status != \'closed\'';
        completedRequestsQuery = 'SELECT COUNT(*) FROM requests WHERE (assigned_to_manager_id = $1 OR created_by = $1) AND status = \'closed\'';
    } else {
        // Employee sees requests created by them or assigned to them
        totalRequestsQuery = 'SELECT COUNT(*) FROM requests WHERE created_by = $1 OR assigned_to = $1';
        pendingRequestsQuery = 'SELECT COUNT(*) FROM requests WHERE (created_by = $1 OR assigned_to = $1) AND status != \'closed\'';
        completedRequestsQuery = 'SELECT COUNT(*) FROM requests WHERE (created_by = $1 OR assigned_to = $1) AND status = \'closed\'';
    }

    const totalRequestsResult = await pool.query(totalRequestsQuery, [userId]);
    const pendingRequestsResult = await pool.query(pendingRequestsQuery, [userId]);
    const completedRequestsResult = await pool.query(completedRequestsQuery, [userId]);

    const totalRequests = parseInt(totalRequestsResult.rows[0].count);
    const pendingRequests = parseInt(pendingRequestsResult.rows[0].count);
    const completedRequests = parseInt(completedRequestsResult.rows[0].count);

    const efficiency = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0;

    return {
        totalRequests,
        pendingRequests,
        completedRequests,
        efficiency: parseFloat(efficiency.toFixed(2)),
    };
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
