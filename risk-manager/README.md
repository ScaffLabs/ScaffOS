# Risk Manager Service

## Project Description
The Risk Manager service is a crucial component in the trading system that manages risk positions. Users can create, update, delete, and retrieve risk positions while ensuring robust features like authentication, request validation, rate limiting, and health checks.

## Architecture Overview
This service utilizes Express.js and adopts a modular architecture. Key components include:
- **API Routes**: Handle incoming HTTP requests.
- **Middleware**: Responsible for authentication, logging, and rate limiting.
- **Business Logic**: Encapsulated in the RiskManager class to manage risk positions.
- **Health Check Endpoints**: Monitor the service's operational status.

## Setup Instructions
### Prerequisites
- **Node.js**: Version 14.x or later.
- **npm**: Version 6.x or later.
- **MongoDB**: For data persistence.

### Install Dependencies
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/risk-manager.git
   cd risk-manager
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Application
1. Create a `.env` file based on the `.env.example` template:
   ```bash
   cp .env.example .env
   ```
2. Start the server:
   ```bash
   npm start
   ```

## API Reference
### GET /api/risk
- **Description**: Retrieve risk positions.
- **Query Parameters**:
  - `limit` (integer): Number of results to return.
  - `offset` (integer): Number of results to skip.
  - `sort` (string): Field to sort by.
  - `filter` (string): Field to filter by.
- **Responses**:
  - `200 OK`: Returns a list of risk positions.
  - `500 Internal Server Error`: An error occurred while fetching data.

### POST /api/risk
- **Description**: Create a new risk position.
- **Request Body**:
  - `asset` (string): The asset for the risk position.
  - `position` (number): The position size.
- **Responses**:
  - `201 Created`: Risk position created successfully.
  - `400 Bad Request`: Invalid input.
  - `500 Internal Server Error`: An error occurred while creating.

### PUT /api/risk/{id}
- **Description**: Update a risk position.
- **Parameters**:
  - `id` (string): Risk position ID.
- **Request Body**:
  - `position` (number): The updated position size.
- **Responses**:
  - `204 No Content`: Risk position updated successfully.
  - `404 Not Found`: Risk position not found.
  - `500 Internal Server Error`: An error occurred while updating.

### DELETE /api/risk/{id}
- **Description**: Delete a risk position.
- **Parameters**:
  - `id` (string): Risk position ID.
- **Responses**:
  - `204 No Content`: Risk position deleted successfully.
  - `404 Not Found`: Risk position not found.
  - `500 Internal Server Error`: An error occurred while deleting.

## Environment Variables
| Variable       | Description               |
|----------------|---------------------------|
| `JWT_SECRET`   | Secret for JWT signing    |
| `EVENT_BUS_URL`| URL for the event bus     |
| `ANOTHER_SERVICE_URL` | URL for another service |
| `NODE_ENV`     | Environment type (development, staging, production) |

## Development Guide
- Use TypeScript for type safety and maintainability.
- Follow the coding standards established in the project.
- Write unit tests for any new features or bug fixes.

## Deployment Guide
- Ensure all environment variables are configured correctly in the production environment.
- Utilize a process manager like PM2 for managing the application.

## Contributing
Refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines on how to contribute to this project.

## Changelog
See the [CHANGELOG.md](CHANGELOG.md) file for version history.