# Request Management Application Backend

Welcome to the backend for the Request Management Application! This system is designed to streamline the process of handling requests within an organization, allowing employees to create requests and managers to approve, reject, or assign them. It's built with Node.js and Express.js, using a PostgreSQL database for data storage.

## Backend Architecture

This backend follows a clear, modular architecture to ensure maintainability and scalability.

*   **Node.js & Express.js:** The core of the application is built using Node.js, a powerful JavaScript runtime, and Express.js, a fast, unopinionated web framework. This combination provides a robust foundation for handling API requests.
*   **PostgreSQL Database:** Data is persistently stored in a PostgreSQL relational database. This includes user information, request details, and their respective statuses.
*   **Modular Structure (MVC-like):** The application loosely follows an MVC (Model-View-Controller) pattern, separating concerns into:
    *   **Routes:** Define the API endpoints and map them to specific controller functions.
    *   **Controllers:** Handle incoming requests, interact with services, and send responses. They are the bridge between the routes and the business logic.
    *   **Services:** Encapsulate the business logic, interacting with the database and performing core operations.
    *   **Middleware:** Functions that have access to the request and response objects, and the next middleware function in the application’s request-response cycle. Used for authentication, error handling, and validation.
*   **Authentication & Authorization:** Implemented using JSON Web Tokens (JWT) for secure user authentication, and middleware to enforce role-based access control for different API endpoints (employees vs. managers).

## Key Functionalities

The backend provides a set of functionalities to manage user authentication and request lifecycles:

### Authentication & User Management
*   **User Registration:** Allows new employees and managers to register with the system.
*   **User Login:** Authenticates existing users and provides them with a JWT for secure access.
*   **Employee Listing:** Provides a list of all registered employees, primarily for managers to assign requests.

### Request Management
*   **Create Request:** Employees can submit new requests with a title, description, and assign them to another employee.
*   **View Requests:** Users can retrieve a list of requests. Employees typically see requests they created or are assigned to, while managers have a broader view of all requests.
*   **View Single Request:** Users can fetch details of a specific request by its ID.
*   **Approve/Reject Request:** Managers have the ability to review and change the status of requests to "approved" or "rejected".
*   **Action Request:** Assigned employees can mark a request as "actioned" to indicate progress.
*   **Close Request:** Assigned employees can close a request once it's completed.
*   **Dashboard Counts:** Provides aggregated counts of requests by status for dashboard analytics.

## API Endpoints

All API endpoints are prefixed with `/api`.

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint      | Description                                     | Access      | Request Body                                                              |
| :----- | :------------ | :---------------------------------------------- | :---------- | :------------------------------------------------------------------------ |
| `POST` | `/register`   | Registers a new user (employee or manager).     | Public      | `{ "username": "string", "password": "string", "role": "employee|manager" }` |
| `POST` | `/login`      | Logs in a user and returns a JWT.               | Public      | `{ "username": "string", "password": "string" }`                          |
| `GET`  | `/employees`  | Retrieves a list of all registered employees.   | Authenticated | None                                                                      |

### Request Management Endpoints (`/api/requests`)

| Method | Endpoint              | Description                                                          | Access      | Request Body (for POST/PUT)                                      |
| :----- | :-------------------- | :------------------------------------------------------------------- | :---------- | :--------------------------------------------------------------- |
| `POST` | `/`                   | Creates a new request.                                               | Employee    | `{ "title": "string", "description": "string", "assigned_to": "int" }` |
| `GET`  | `/`                   | Retrieves all requests (filtered by user role).                      | Authenticated | None                                                             |
| `GET`  | `/:id`                | Retrieves a single request by ID.                                    | Authenticated | None                                                             |
| `PUT`  | `/:id/approve`        | Approves or rejects a request.                                       | Manager     | `{ "status": "approved|rejected" }`                              |
| `PUT`  | `/:id/action`         | Marks a request as actioned by the assigned employee.                | Employee    | None                                                             |
| `PUT`  | `/:id/close`          | Closes a request by the assigned employee.                           | Employee    | None                                                             |
| `GET`  | `/dashboard-counts`   | Retrieves counts of requests for dashboard display.                  | Authenticated | None                                                             |

## How to Start the Backend

Follow these steps to get the Request Management Application backend up and running on your local machine.

### Prerequisites

*   Node.js (LTS version recommended)
*   npm (Node Package Manager)
*   PostgreSQL database server

### Setup Steps

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/Kdhanush17/Request-Management-Application-Backend.git
    cd Request-Management-Application-Backend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables:**
    Create a `.env` file in the root directory of the project and add the following variables. Replace the placeholder values with your actual database credentials and JWT secret.

    ```dotenv
    # Application Configuration
    PORT=5000 # Or any port you prefer
    NODE_ENV=local # local, dev, uat, prod

    # Database Configuration
    DB_USER=your_pg_username
    DB_HOST=localhost
    DB_NAME=your_database_name
    DB_PASSWORD=your_pg_password
    DB_PORT=5432 # Default PostgreSQL port

    # JWT Secret for authentication
    JWT_SECRET=supersecretjwtkey
    JWT_EXPIRES_IN=1h
    ```

4.  **Initialize Database Schema:**
    Execute the SQL script to create the necessary tables in your PostgreSQL database.
    You can use a PostgreSQL client (like `psql` or DBeaver) to run the `database/init.sql` script.

    Example using `psql`:
    ```bash
    psql -U your_pg_username -d your_database_name -h localhost -p 5432 -f database/init.sql
    ```

5.  **Run the Application:**
    You can start the server in development mode using `nodemon` (which automatically restarts the server on file changes) or in a production-like environment.

    *   **For Local Development (with Nodemon):**
        ```bash
        npm run local
        ```
        The server will run on `http://localhost:5000` (or your specified PORT).

    *   **For Production (e.g., without Nodemon):**
        ```bash
        npm run prod
        ```

## Folder Structure

This project is organized to promote clarity and ease of maintenance:

```
.
├── .env                          # Environment variables for configuration
├── .gitignore                    # Specifies intentionally untracked files to ignore
├── index.js                      # Main entry point of the application
├── package.json                  # Project metadata and dependencies
├── package-lock.json             # Records the exact dependency tree
├── README.md                     # This file!
├── config/                       # Application configuration files
│   ├── apiStatus.js              # Defines API status codes/messages (if applicable)
│   ├── appConfig.js              # General application settings
│   ├── db.js                     # Database connection setup
│   ├── environment.js            # Loads and manages environment-specific variables
│   └── passport.js               # Passport.js configuration for authentication (if used)
├── database/                     # Database-related files
│   └── init.sql                  # SQL script to initialize the database schema
├── helpers/                      # Utility functions or helper modules
├── logs/                         # Directory for application logs
├── middleware/                   # Express middleware functions
│   ├── auth.js                   # Authentication middleware (JWT verification)
│   └── errorHandler.js           # Global error handling middleware
├── routes/                       # Defines all API routes
│   ├── auth.js                   # Routes for authentication (register, login, etc.)
│   └── requests.js               # Routes for request management
├── src/                          # Source code for core application logic
│   ├── controllers/              # Handles request logic, interacts with services
│   │   ├── authController.js     # Controller for authentication-related actions
│   │   └── requestController.js  # Controller for request management actions
│   └── services/                 # Business logic, interacts directly with the database
│       ├── authService.js        # Service for authentication-related business logic
│       └── requestService.js     # Service for request management business logic
└── utils/                        # General utility functions
└── views/                        # (Potentially for server-side rendered views, or left empty for API-only)
```

This structure helps in keeping the code organized, making it easier to navigate, understand, and extend the application.
