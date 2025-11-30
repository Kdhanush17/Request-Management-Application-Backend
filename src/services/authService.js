const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');
const env = require('../../config/environment')

const registerUser = async (username, password, role) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
        [username, hashedPassword, role || 'employee']
    );
    return newUser.rows[0];
};

const loginUser = async (username, password) => {
;

    const user = await pool.query(
  'SELECT * FROM users WHERE LOWER(username) = LOWER($1)',
  [username]
);
    if (user.rows.length === 0) {
        throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);

    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    const payload = {
        user: {
            id: user.rows[0].id,
            role: user.rows[0].role,
        },
    };

    const token = jwt.sign(
        payload,
        env.jwtKey,
        { expiresIn: env.expiresIn }
    );

    return { token, user: { id: user.rows[0].id, username: user.rows[0].username, role: user.rows[0].role } };
};

const getAllEmployees = async () => {
    const employees = await pool.query('SELECT id, username FROM users WHERE role = $1', ['employee']);
    return employees.rows;
};


const getUserWithManager = async (userId) => {
    const user = await pool.query(
        'SELECT u.id, u.username, u.role, u.manager_id, m.username as manager_username FROM users u LEFT JOIN users m ON u.manager_id = m.id WHERE u.id = $1',
        [userId]
    );
    return user.rows[0];
};

module.exports = {
    registerUser,
    loginUser,
    getAllEmployees,
    getUserWithManager
};
