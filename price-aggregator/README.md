# Price Aggregator

## Project Description
The Price Aggregator service fetches real-time prices from multiple exchanges, calculates the Volume Weighted Average Price (VWAP), and provides a RESTful API for clients to access this data.

## Architecture Overview
The service is built using Node.js, Express for the API, and WebSocket for real-time price broadcasting. It uses a circuit breaker pattern for resilient HTTP requests to external price exchanges. The service also implements memory monitoring and error handling middleware to ensure robustness.

## Setup Instructions
### Prerequisites
- Node.js (version 14 or higher)
- npm (Node package manager)

### Install
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/price-aggregator.git
   cd price-aggregator
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Run
To start the application:
```bash
npm start
```

### Testing
To run the tests:
```bash
npm test
```
To run tests in watch mode:
```bash
npm run test:watch
```

## API Reference
### GET /prices
- **Request Body**: None
- **Response**: Returns current prices and VWAP.
  - **200 OK**: Successful retrieval of prices.
  - **204 No Content**: No prices available.
  - **500 Internal Server Error**: Failed to fetch prices.

### GET /health
- **Request Body**: None
- **Response**: Returns the health status of the service.
  - **200 OK**: Service is healthy.
  - **500 Internal Server Error**: Service is unhealthy.

## Environment Variables
| Variable      | Description                        | Default Value         |
|---------------|------------------------------------|-----------------------|
| BASE_URL     | Base URL for price exchanges       | https://api.example.com |

## Development Guide
- Use `npm run dev` to start the service in development mode.
- All modifications should be accompanied by appropriate tests in the `__tests__` directory.

### Code Guidelines
- Follow the existing coding standards (e.g., TypeScript conventions).
- Ensure code is well-documented, especially complex logic.
- Maintain consistency in code style and formatting.

## Deployment Guide
- Ensure that the environment variables are set correctly on the production server.
- Use a process manager like PM2 for running the service in production.
- Monitor logs and performance metrics post-deployment for any issues.

## Contributing
Please see the [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing to this project.

## Changelog
See [CHANGELOG.md](CHANGELOG.md) for version history.