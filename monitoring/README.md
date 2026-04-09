# Monitoring Service

## Project Description
The Monitoring Service provides health checks and dashboard monitoring for various microservices in the application ecosystem. It aggregates data related to service health, request latency, and error handling to ensure a robust and reliable system.

## Architecture Overview
The service is built using Node.js and Express, utilizing an in-memory data store for simplicity. It interfaces with other services through HTTP requests and employs middleware for logging, error handling, and input sanitization.

## Setup Instructions
### Prerequisites
- Node.js (version 14 or higher)
- npm (Node package manager)

### Install
1. Clone the repository:
   ```bash
   git clone https://github.com/your_username/monitoring.git
   cd monitoring
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Run
1. Start the service:
   ```bash
   npm start
   ```
2. The service will run on `http://localhost:3000` by default.

## API Reference
### Health Check
- **Method**: GET
- **Path**: /health
- **Request**: No body required
- **Response**:
  - **Body**: `{ "status": "UP" }`
  - **Status Codes**:
    - `200`: Service is running
    - `500`: Internal server error

### Dashboard
- **Method**: GET
- **Path**: /dashboard
- **Request**: No parameters
- **Response**:
  - **Body**: Array of dashboard entries (e.g., `[{ "id": "1", "data": { "value": 100 } }, ...]`)
  - **Status Codes**:
    - `200`: Successfully retrieved entries
    - `204`: No entries available
    - `500`: Internal server error

### Create Dashboard Entry
- **Method**: POST
- **Path**: /dashboard
- **Request Body**:
  ```json
  {
    "id": "your_entry_id",
    "value": 123
  }
  ```
- **Response**:
  - **Body**: `{ "message": "Entry created", "id": "your_entry_id" }`
  - **Status Codes**:
    - `201`: Entry successfully created
    - `400`: Invalid input data

### Update Dashboard Entry
- **Method**: PUT
- **Path**: /dashboard/:id
- **Request Body**:
  ```json
  {
    "value": 456
  }
  ```
- **Response**:
  - **Status Codes**:
    - `204`: Entry successfully updated
    - `400`: Invalid input data
    - `404`: Entry not found

### Delete Dashboard Entry
- **Method**: DELETE
- **Path**: /dashboard/:id
- **Response**:
  - **Status Codes**:
    - `204`: Entry successfully deleted
    - `404`: Entry not found

## Environment Variables
| Variable               | Description                               |
|-----------------------|-------------------------------------------|
| `PORT`                | The port on which the service runs.      |
| `ORDER_SERVICE_URL`   | URL for the order service.                |
| `USER_SERVICE_URL`    | URL for the user service.                 |
| `NODE_ENV`            | Current environment (development/production). |

## Development Guide
- Use TypeScript for all new code.
- Ensure that all new features are accompanied by relevant unit tests.
- Follow existing coding conventions and standards.

## Deployment Guide
- Build the Docker image:
  ```bash
  docker build -t monitoring-service .
  ```
- Run the service in Docker:
  ```bash
  docker run -p 3000:3000 monitoring-service
  ```
- Use a process manager like PM2 for production deployments.

## Contribution Guidelines
We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for more information.

## Changelog
See [CHANGELOG.md](./CHANGELOG.md) for version history and updates.