# Portfolio Tracker

## Project Description
The Portfolio Tracker service allows users to create, retrieve, and update their investment portfolios through a RESTful API. It manages portfolios and their positions, providing essential features for tracking investments.

## Architecture Overview
The service is built using Node.js and Express, utilizing both in-memory storage and MongoDB for persistent storage of portfolios. The architecture includes middleware for validation, error handling, and logging, alongside an event bus for handling portfolio updates. The service is designed to be robust, scalable, and easy to maintain.

## Setup Instructions
### Prerequisites
- Node.js (version 14 or higher)
- NPM (Node Package Manager)
- MongoDB (for persistent storage)
- Docker (optional, for containerization)

### Install
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/portfolio-tracker.git
   cd portfolio-tracker
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
2. The service will be available at `http://localhost:3000/api/portfolios`.

## API Reference
### POST /api/portfolios
- **Request Body:** `{ "name": string, "positions": [{ "symbol": string, "quantity": number, "averagePrice": number }] }`
- **Response:** `201 Created` with portfolio object
- **Status Codes:**
  - `201`: Portfolio created successfully
  - `400`: Bad request due to validation errors

### GET /api/portfolios/:id
- **Response:** `200 OK` with portfolio object or `404 Not Found`
- **Status Codes:**
  - `200`: Portfolio found
  - `404`: Portfolio not found

### PUT /api/portfolios/:id
- **Request Body:** `{ "name": string, "positions": [{ "symbol": string, "quantity": number, "averagePrice": number }] }`
- **Response:** `200 OK` with updated portfolio object or `400 Bad Request`
- **Status Codes:**
  - `200`: Portfolio updated successfully
  - `400`: Invalid update request

### DELETE /api/portfolios/:id
- **Response:** `204 No Content` or `404 Not Found`
- **Status Codes:**
  - `204`: Portfolio deleted successfully
  - `404`: Portfolio not found

### GET /health
- **Response:** `200 OK` with service health status.
- **Status Codes:**
  - `200`: Service is up
  - `503`: Service is down

## Environment Variables
| Variable                   | Description                                         | Default Value                             |
|----------------------------|-----------------------------------------------------|------------------------------------------|
| PORT                       | Port on which the service listens                   | 3000                                     |
| PORTFOLIO_SERVICE_URL     | URL for external portfolio service                  | http://localhost:3001/api/portfolios   |
| NODE_ENV                   | Environment mode (development, staging, production)| development                               |
| DATABASE_URL               | Database connection string                          | mongodb://localhost:27017/portfolio-tracker |
| LOG_LEVEL                  | Level of logging (debug, info, warn, error)       | info                                     |

## Development Guide
- Follow standard coding practices for JavaScript/TypeScript.
- Write tests for any new features.
- Ensure the service is well-documented.

## Deployment Guide
- Use Docker for containerized deployment:
  1. Build the Docker image:
     ```bash
     docker build -t portfolio-tracker .
     ```
  2. Run the Docker container:
     ```bash
     docker run -p 3000:3000 portfolio-tracker
     ```

## Contributing
See the [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- Thanks to the open-source community for their contributions and support.