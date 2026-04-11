# Risk Manager Service

## Project Description
The Risk Manager service is designed to handle risk position management for a trading system. It allows users to create, update, retrieve, and delete risk positions, while enforcing position limits and generating alerts for risk-related events.

## Architecture Overview
The service is built using Node.js and TypeScript, utilizing Express for the HTTP server. It includes middleware for logging, error handling, and authentication. The service interacts with an in-memory storage solution for managing risk positions.

## Setup Instructions
### Prerequisites
- Node.js (version 14 or later)
- npm (Node package manager)
- Docker (optional, for containerization)

### Install
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd risk-manager
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Run
To start the service:
```bash
npm start
```
The service will run on port 3000 by default.

## API Reference
### Create Risk Position
- **Method**: POST
- **Path**: /api/risk
- **Request Body**:
  ```json
  {
    "asset": "AAPL",
    "position": 50
  }
  ```
- **Response**:
  - **201 Created** on success, returns the created risk position.
  - **400 Bad Request** if validation fails.

### Retrieve Risk Positions
- **Method**: GET
- **Path**: /api/risk
- **Query Parameters**: `limit`, `offset`
- **Response**:
  - **200 OK** returns an array of risk positions.

### Update Risk Position
- **Method**: PUT
- **Path**: /api/risk/:id
- **Request Body**:
  ```json
  {
    "position": 100
  }
  ```
- **Response**:
  - **204 No Content** on success.
  - **404 Not Found** if the position does not exist.

### Delete Risk Position
- **Method**: DELETE
- **Path**: /api/risk/:id
- **Response**:
  - **204 No Content** on success.
  - **404 Not Found** if the position does not exist.

## Environment Variables
| Variable            | Description                                     |
|---------------------|-------------------------------------------------|
| JWT_SECRET          | Secret key for signing JWT tokens for authentication. |
| EVENT_BUS_URL       | URL for the event bus service to publish and subscribe to events related to risk positions. |
| ANOTHER_SERVICE_URL  | URL for another dependent service that provides additional data or functionality required by this service. |
| NODE_ENV            | Determines the environment in which the application runs (development, staging, production). |
| PORT                | The port on which the service listens for incoming requests. Default is set to 3000.

## Development Guide
To develop the service:
1. Set up your development environment with the necessary dependencies.
2. Use `npm test` to run the test suite.
3. Follow the contribution guidelines outlined in CONTRIBUTING.md.

## Deployment Guide
For deployment, consider using Docker for containerization. Ensure that the environment variables are set appropriately for the production environment.

## Changelog
See CHANGELOG.md for a detailed history of changes and updates.