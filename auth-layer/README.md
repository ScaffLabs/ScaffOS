# Auth Layer Service

## Project Description
The Auth Layer Service provides authentication and authorization features for applications, including user management, JWT-based token generation, API key generation and validation, and health checks for service status.

## Architecture Overview
The service is built on Node.js with Express, utilizing PostgreSQL for data storage. It employs JWT for secure token management and uses bcrypt for password hashing. The service is designed to be modular for easier maintenance and scaling.

## Setup Instructions
### Prerequisites
- Node.js (v14 or greater)
- PostgreSQL (v12 or greater)
- Docker (optional, for containerization)

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
1. Start the service:
   ```bash
   npm run start
   ```
2. For Docker users, run:
   ```bash
   docker-compose up
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

## Environment Variables
| Variable          | Description                         |
|-------------------|-------------------------------------|
| NODE_ENV          | Environment (development/production)|
| JWT_SECRET        | Secret key for JWT                  |
| API_KEY_SECRET    | Secret key for API key generation   |
| DATABASE_URL      | Database connection string          |

## Development Guide
- Follow the coding standards outlined in the repository.
- Ensure all tests are passing before submitting a pull request.

## Deployment Guide
- Ensure environment variables are set correctly.
- Use Docker for containerized deployment.
- Monitor logs and health checks after deployment.

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## Changelog
See [CHANGELOG.md](CHANGELOG.md) for version history.