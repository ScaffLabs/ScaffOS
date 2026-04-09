# Risk Manager Service

## Project Description
The Risk Manager service is a backend application designed to assist organizations in managing and assessing their risk positions in trading systems. It provides functionalities to create, read, update, and delete risk positions associated with various assets, thereby facilitating better risk management and reporting.

## Architecture Overview
The service is built using Node.js and Express, with TypeScript utilized for type safety. The key components include:
- **API**: RESTful endpoints for managing risk positions.
- **Storage**: In-memory storage for quick access and manipulation of risk data.
- **Logging**: Winston is employed for logging application events and errors.

## Setup Instructions
### Prerequisites
- Node.js (version 14 or higher)
- npm (Node Package Manager)

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
1. Start the application:
   ```bash
   npm start
   ```
2. Access the API at `http://localhost:3000/api/risk`

## API Reference
### GET /api/risk
- **Description**: Retrieve risk positions.
- **Query Parameters**:
  - `limit` (integer, optional): Number of results to return.
  - `offset` (integer, optional): Number of results to skip.
- **Responses**:
  - `200 OK`: Returns a list of risk positions.
  - `500 Internal Server Error`: An error occurred while fetching data.

### POST /api/risk
- **Description**: Create a new risk position.
- **Request Body**:
  - `asset` (string): The asset for the risk position.
  - `position` (number): The position size, must be a non-negative number.
- **Responses**:
  - `201 Created`: Risk position created successfully.
  - `400 Bad Request`: Invalid input, such as negative position or missing asset.
  - `500 Internal Server Error`: An error occurred while creating.

### PUT /api/risk/{id}
- **Description**: Update a risk position.
- **Parameters**:
  - `id` (string): Risk position ID.
- **Request Body**:
  - `position` (number): The updated position size, must be a non-negative number.
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
| Variable            | Description                            |
|---------------------|----------------------------------------|
| JWT_SECRET          | Secret key for JWT signing             |
| EVENT_BUS_URL       | URL for the event bus service          |
| ANOTHER_SERVICE_URL  | URL for another dependent service      |
| NODE_ENV            | Environment type (development/production) |
| PORT                | Server port number                     |

## Development Guide
- Use `npm test` to run tests.
- Use `npm run test:watch` for running tests in watch mode.

## Deployment Guide
- Build the application using `npm run build`.
- Deploy the built application on the desired server configuration.

## Contributing
Contributions are welcome! Please refer to the CONTRIBUTING.md file for guidelines.

## License
This project is licensed under the MIT License.