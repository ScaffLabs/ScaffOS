# Trading Dashboard

## Project Description
The Trading Dashboard is a web application that allows users to monitor their trading positions and manage orders in real-time. It provides functionality for visualizing price data through charts and managing stock positions effectively.

## Architecture Overview
The application is built using TypeScript and Express, following a microservices architecture. It communicates with an external data service for fetching market data and supports various API endpoints for interaction.

## Setup Instructions
### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)

### Install
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/trading-dashboard.git
   cd trading-dashboard
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Run
1. Start the MySQL service as defined in `docker-compose.yml`:
   ```bash
   docker-compose up
   ```
2. Start the application:
   ```bash
   npm start
   ```
3. Access the application at `http://localhost:3000`.

## API Reference
### Health Check
- **GET** `/api/health`
  - **Response:** `200 OK`
  - **Description:** Checks the health of the service.

### Positions
- **GET** `/api/positions`
  - **Response:** `200 OK`
  - **Description:** Retrieves all positions.

- **POST** `/api/positions`
  - **Request Body:** `{ "id": "string", "symbol": "string", "quantity": number }`
  - **Response:** `201 Created`
  - **Description:** Creates a new position.

- **PUT** `/api/positions/:id`
  - **Request Body:** `{ "quantity": number }`
  - **Response:** `204 No Content`
  - **Description:** Updates a position by ID.

- **DELETE** `/api/positions/:id`
  - **Response:** `204 No Content`
  - **Description:** Deletes a position by ID.

### Orders
- **POST** `/api/orders`
  - **Request Body:** `{ "id": "string", "symbol": "string", "quantity": number, "type": "buy|sell" }`
  - **Response:** `201 Created`
  - **Description:** Submits a new order.

## Environment Variables
| Variable              | Description                              |
|----------------------|------------------------------------------|
| NODE_ENV             | Environment mode (development/production) |
| PORT                 | Port on which the server will run        |
| API_URL              | Base URL for the API                     |
| DB_HOST              | Database host                             |
| DB_USER              | Database user                             |
| DB_PASSWORD          | Database password                         |
| DB_NAME              | Database name                             |
| EXTERNAL_API_URL     | External API base URL                    |
| LOG_LEVEL            | Logging level (debug/info/warn/error)   |

## Development Guide
To contribute to the project:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/YourFeature`).
3. Make your changes and commit.
4. Push to your fork (`git push origin feature/YourFeature`).
5. Create a pull request.

## Deployment Guide
For production deployment, ensure to set the environment variables correctly and use a process manager like PM2 for running the application.

## License
This project is licensed under the MIT License.