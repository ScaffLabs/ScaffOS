# Trading Dashboard

## Project Description
This is a trading dashboard application that allows users to manage their trading positions and place orders. It provides real-time charting functionality and integrates with an external service for real-time data.

## Architecture Overview
The application is built using Node.js and Express for the backend, with a React frontend. It utilizes an in-memory store for managing positions and integrates with external APIs for data fetching.

## Setup Instructions
### Prerequisites
- Node.js (v14 or higher)
- Docker (optional for containerized setup)
- MySQL (for the database)

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
3. Create a `.env` file based on `.env.example` and update the values.

### Run
1. Start the application:
   ```bash
   npm start
   ```
2. For Docker users, run:
   ```bash
   docker-compose up
   ```

## API Reference
### Health Check
- **GET** `/api/health`
  - **Response:** `200 OK`
  - **Description:** Check the health of the service.

### Positions
- **GET** `/api/positions`
  - **Response:** `200 OK`
  - **Description:** Retrieve all positions.

- **POST** `/api/positions`
  - **Request Body:** `{ "id": "string", "symbol": "string", "quantity": number }`
  - **Response:** `201 Created`
  - **Description:** Create a new position.

- **PUT** `/api/positions/:id`
  - **Request Body:** `{ "quantity": number }`
  - **Response:** `204 No Content`
  - **Description:** Update a position by ID.

- **DELETE** `/api/positions/:id`
  - **Response:** `204 No Content`
  - **Description:** Delete a position by ID.

### Orders
- **POST** `/api/orders`
  - **Request Body:** `{ "id": "string", "symbol": "string", "quantity": number, "type": "buy|sell" }`
  - **Response:** `201 Created`
  - **Description:** Submit a new order.

## Environment Variables
| Variable          | Description                        |
|-------------------|-------------------------------------|
| NODE_ENV          | Environment (development/production)|
| PORT              | Port for the server                |
| API_URL           | Base URL for the API               |
| DB_HOST           | Database host                      |
| DB_USER           | Database user                      |
| DB_PASSWORD       | Database password                  |
| DB_NAME           | Database name                      |
| EXTERNAL_API_URL  | URL for the external API service   |

## Development Guide
- Use ESLint for linting the code.
- Write tests for new features using Jest.
- Follow the established coding conventions.

## Deployment Guide
- Ensure environment variables are set up in the production environment.
- Use Docker for containerization if required.

## Contributing
Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## Changelog
See [CHANGELOG.md](./CHANGELOG.md) for the version history.