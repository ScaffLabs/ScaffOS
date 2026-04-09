# Order Engine

## Project Description
The Order Engine is a microservice responsible for managing orders in a trading system. It allows users to create, retrieve, update, and delete orders while providing health and readiness checks.

## Architecture Overview
The service uses a REST API built with Express.js, utilizing an in-memory storage mechanism for orders. It manages requests through a queue system to ensure reliability and scalability.

## Setup Instructions
### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (if using persistent storage)

### Install
1. Clone the repository:
   ```bash
   git clone https://github.com/your/repo.git
   cd order-engine
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Run
1. Set environment variables (create a `.env` file):
   ```bash
   PORT=3000
   BASE_URL=http://localhost:3000
   DATABASE_URL=postgres://your_user:your_password@db:5432/your_database
   ANOTHER_SERVICE_URL=http://another-service:4000
   ORDER_SERVICE_URL=http://order-service:5000
   MEMORY_LIMIT=80%
   ```
2. Start the server:
   ```bash
   npm start
   ```

## API Reference
### Health Check
- **GET** `/health`
  - Returns the health status of the service.
  - **Response:** `200 OK` if healthy.

### Readiness Check
- **GET** `/ready`
  - Returns readiness status.
  - **Response:** `200 OK` if ready.

### Orders
- **POST** `/orders`
  - Create a new order.
  - **Request Body:** `{ id: string, type: string, price: number, quantity: number, status: string }`
  - **Response:** `201 Created` with the created order.

- **GET** `/orders`
  - Retrieve all orders.
  - **Response:** `200 OK` with an array of orders.

- **PUT** `/orders/:id`
  - Update an existing order.
  - **Request Body:** `{ type?: string, price?: number, quantity?: number, status?: string }`
  - **Response:** `200 OK` with the updated order.

- **DELETE** `/orders/:id`
  - Delete an order.
  - **Response:** `204 No Content` if successful.

## Environment Variables
| Variable    | Description                       |
|-------------|-----------------------------------|
| PORT        | Port for the server to listen on  |
| BASE_URL    | Base URL for external API calls    |
| DATABASE_URL | URL for the database connection   |
| ANOTHER_SERVICE_URL | URL for another service connection   |
| ORDER_SERVICE_URL | URL for order service connection   |
| MEMORY_LIMIT | Memory limit for the application   |

## Development Guide
- Ensure you have the necessary environment set up.
- Use `npm test` to run the test suite.

## Deployment Guide
- Build the application using `npm run build`.
- Deploy to your preferred cloud provider.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request.

## CHANGELOG
### [1.0.0] - 2023-10-01
- Initial release of the Order Engine service.

### [1.0.1] - 2023-10-15
- Improved error handling in order services.
- Enhanced logging for order processing.

### [1.0.2] - 2023-10-30
- Resolved issue with invalid order data handling.
- Fixed memory leak in the event bus implementation.

### [1.0.3] - 2023-11-15
- Dockerfile and docker-compose for easy deployment.
- Updated README with detailed setup instructions.

### [1.0.4] - 2023-11-20
- Comprehensive documentation including API reference, environment variables table, and development guide.

### [1.0.5] - 2023-11-25
- Added detailed inline documentation to orderController.ts for better code understanding.
- Improved overall code structure and readability.