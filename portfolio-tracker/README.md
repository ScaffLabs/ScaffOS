# Portfolio Tracker

## Project Description
The Portfolio Tracker service allows users to manage their investment portfolios by creating, retrieving, and updating portfolio information.

## Architecture Overview
This service is built using Node.js and Express. It utilizes an event bus for handling portfolio updates and is structured to allow easy scalability and maintainability.

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
  - `400`: Bad request

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
  - `400`: Invalid update

## Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| PORT     | Port to listen on | 3000 |

## Development Guide
1. Use `npm run test` to run tests.
2. Follow best practices for code contributions.

## Deployment Guide
Use Docker for containerization or deploy directly to a cloud service of your choice.

## Contributing
Please read the [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Changelog
See the [CHANGELOG.md](CHANGELOG.md) for a history of changes.