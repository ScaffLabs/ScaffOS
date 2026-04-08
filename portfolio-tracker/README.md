# Portfolio Tracker

## Project Description
The Portfolio Tracker service allows users to manage their investment portfolios by creating, retrieving, and updating portfolio information. This service is designed to be scalable and maintainable, leveraging an event-driven architecture to handle updates efficiently.

## Architecture Overview
This service is built using Node.js and Express, utilizing an event bus for handling portfolio updates and Axios for making HTTP requests to external services. The service is structured to allow easy extensibility and integration with other services.

## Setup Instructions
### Prerequisites
- Node.js (>= 14.0.0)
- npm (>= 6.0.0)

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
2. The service will be running on `http://localhost:3000/api/portfolios`.

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

### GET /health
- **Response:** `200 OK` with service health status.
- **Status Codes:**
  - `200`: Service is up
  - `503`: Service is down

## Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| PORT     | Port to listen on | 3000 |
| PORTFOLIO_SERVICE_URL | External portfolio service URL | http://localhost:3001/api/portfolios |

## Development Guide
1. Use `npm run test` to run tests.
2. Follow best practices for code contributions, including proper documentation and test coverage.

## Deployment Guide
The service can be containerized using Docker or deployed directly to a cloud service provider. Ensure to set the environment variables in your deployed environment.

## Contributing
Please read the [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Changelog
See the [CHANGELOG.md](CHANGELOG.md) for a history of changes.