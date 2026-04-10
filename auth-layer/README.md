# Auth Layer Service

## Project Description
The Auth Layer Service provides user authentication and authorization features for a microservices architecture. It supports user management, API key generation, and JWT-based sessions. This service acts as a centralized hub for authentication-related operations.

## Architecture Overview
The Auth Layer is built using Express.js and is designed to work in a microservices environment. It interacts with user and order services, providing health checks and ensuring security through API keys and JWT.

### Key Features
- User registration and management
- JWT authentication
- API key generation and validation
- Health check endpoints

## Setup Instructions
### Prerequisites
- Node.js (>=14.x)
- PostgreSQL database
- Docker (optional, for containerized setup)

### Install
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/auth-layer.git
   cd auth-layer
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Run
1. Start the PostgreSQL database:
   ```bash
   docker-compose up -d
   ```
2. Start the Auth Layer service:
   ```bash
   npm start
   ```

## API Reference
### Health Check
- **Method:** GET
- **Path:** /health
- **Response:** `{ status: 'healthy' }`
- **Status Codes:** 200 OK

### User Management
- **Create User**
  - **Method:** POST
  - **Path:** /api/users
  - **Request Body:** `{ username: string, email: string }`
  - **Response:** User object
  - **Status Codes:** 201 Created, 409 Conflict

- **Get All Users**
  - **Method:** GET
  - **Path:** /api/users
  - **Response:** Array of User objects
  - **Status Codes:** 200 OK

- **Update User**
  - **Method:** PUT
  - **Path:** /api/users/:id
  - **Request Body:** `{ username?: string, email?: string }`
  - **Response:** 204 No Content
  - **Status Codes:** 204 No Content, 404 Not Found

- **Delete User**
  - **Method:** DELETE
  - **Path:** /api/users/:id
  - **Response:** 204 No Content
  - **Status Codes:** 204 No Content, 404 Not Found

### Error Handling
- **Validation Errors**: Returns 400 status with error details.
- **Not Found**: Returns 404 status when a user is not found.
- **Internal Server Errors**: Returns 500 status for unexpected errors.

## Environment Variables
| Variable             | Description                        |
|----------------------|------------------------------------|
| NODE_ENV             | Environment (development/production)|
| JWT_SECRET           | Secret key for JWT signing         |
| API_KEY_SECRET       | Secret key for API key generation  |
| DATABASE_URL         | Connection string to PostgreSQL    |
| USER_SERVICE_URL     | URL of the User Service            |
| ORDER_SERVICE_URL    | URL of the Order Service           |
| LOG_LEVEL            | Level of logging (info/debug/error)|

## Development Guide
- Use TypeScript for development.
- Follow coding standards and add comments for complex logic.
- Run tests frequently during development.

## Deployment Guide
- Ensure the database is running and migrations are applied.
- Build the project and run in production mode.
- Monitor logs for any issues during runtime.

## Contributing
Please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## Changelog
Refer to [CHANGELOG.md](CHANGELOG.md) for version history.