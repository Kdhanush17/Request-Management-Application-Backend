CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'manager')),
    manager_id INT REFERENCES users(id) -- Self-referencing foreign key for manager
);

CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INT NOT NULL REFERENCES users(id),
    assigned_to INT NOT NULL REFERENCES users(id),
    assigned_to_manager_id INT REFERENCES users(id), -- Manager of the assigned employee
    status VARCHAR(50) NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected', 'actioned', 'closed')),
    manager_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE approvals (
    id SERIAL PRIMARY KEY,
    request_id INT NOT NULL REFERENCES requests(id),
    manager_id INT NOT NULL REFERENCES users(id),
    status VARCHAR(50) NOT NULL CHECK (status IN ('approved', 'rejected')),
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed some initial data
INSERT INTO users (username, password, role) VALUES
('managerA', '$2b$10$9BJoaMNr1YhzXADmie/3N.gEf8FXpc3V9JvesxdcVicno1dCto5Hi', 'manager'); -- password: password123

INSERT INTO users (username, password, role, manager_id) VALUES
('employeeA', '$2b$10$9BJoaMNr1YhzXADmie/3N.gEf8FXpc3V9JvesxdcVicno1dCto5Hi', 'employee', (SELECT id FROM users WHERE username = 'managerA')), -- password: password123, manager: managerA
('employeeB', '$2b$10$9BJoaMNr1YhzXADmie/3N.gEf8FXpc3V9JvesxdcVicno1dCto5Hi', 'employee', (SELECT id FROM users WHERE username = 'managerA')); -- password: password123, manager: managerA
