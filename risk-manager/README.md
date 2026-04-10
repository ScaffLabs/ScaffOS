# Risk Manager Service

## Project Description
The Risk Manager service provides a comprehensive solution for managing risk positions within a trading system. It allows users to create, update, retrieve, and delete risk positions while ensuring compliance with defined limits and providing alerting mechanisms for any anomalies.

## Architecture Overview
The service is built using Node.js and TypeScript, utilizing Express for RESTful API design. It employs an in-memory storage solution for rapid access and manipulation of risk data, alongside middleware for logging, error handling, and request validation.

## Setup Instructions
### Prerequisites
- Node.js (v14 or above)
- npm (v6 or above)
- MySQL (if you wish to connect to a database)

### Install
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/risk-manager.git
   cd risk-manager
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the `.env.example` to `.env` and configure your environment variables.

### Run
1. Start the service:
   ```bash
   npm start
   ```
2. The service will be running at `http://localhost:3000`.

## API Reference
### Risk Positions
- **GET** `/api/risk`  
  Retrieve all risk positions.  
  **Query Parameters:**  
  - `limit`: number of results to return (optional)  
  - `offset`: number of results to skip (optional)  
  **Responses:**  
  - 200: List of risk positions  
  - 500: Internal Server Error

- **POST** `/api/risk`  
  Create a new risk position.  
  **Request Body:**  
  ```json
  {
    "asset": "AAPL",
    "position": 100
  }
  ```  
  **Responses:**  
  - 201: Risk position created  
  - 400: Validation error

- **PUT** `/api/risk/{id}`  
  Update a risk position by ID.  
  **Request Body:**  
  ```json
  {
    "position": 150
  }
  ```  
  **Responses:**  
  - 204: Risk position updated  
  - 404: Not Found

- **DELETE** `/api/risk/{id}`  
  Delete a risk position by ID.  
  **Responses:**  
  - 204: Risk position deleted  
  - 404: Not Found

## Environment Variables
| Variable            | Description                                     |
|---------------------|-------------------------------------------------|
| JWT_SECRET          | Secret key for JWT signing                       |
| EVENT_BUS_URL       | URL for the event bus service                    |
| ANOTHER_SERVICE_URL  | URL for another dependent service                |
| NODE_ENV            | Environment type (development/production)       |
| PORT                | Server port number                              |

## Development Guide
- Use `npm test` to run tests.
- Use `npm run test:watch` for running tests in watch mode.
- Ensure to have the .env file set up for local development with the necessary environment variables.

## Deployment Guide
- Ensure that environment variables are correctly set for production.
- Utilize Docker for containerization if required.
- Monitor service logs for any anomalies post-deployment.

## Contributing
Please refer to [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing to this project.