# Analytics Panel

## Project Description
The Analytics Panel is a web application that provides performance metrics for trading strategies, allowing users to compare and analyze different strategies to make informed trading decisions.

## Architecture Overview
The application is built using Node.js and Express for the backend, with MongoDB as the database for storing strategies. The frontend is developed using React, enabling a dynamic and responsive user interface. The application consists of several microservices and utilizes an event-driven architecture to handle asynchronous operations.

## Setup Instructions
### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or as a Docker container)
- Docker (optional, for containerized deployment)

### Install
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/analytics-panel.git
   cd analytics-panel
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Run
1. Start the MongoDB service (if not running):
   ```bash
   docker-compose up -d mongo
   ```
2. Start the application:
   ```bash
   npm start
   ```
3. Access the application at `http://localhost:3000`.

## API Reference
### Performance Metrics
- **GET /api/performance**  
  Fetches the performance metrics for the strategies.  
  **Response:** 200 OK  
  ```json
  {
      "drawdown": [10, 20, 30],
      "maxDrawdown": 30,
      "sharpeRatio": 1.5
  }
  ```

### Strategy Comparison
- **GET /api/compare**  
  Compares two strategies based on their names.  
  **Query Parameters:**
  - `strategyA`: Name of the first strategy to compare.
  - `strategyB`: Name of the second strategy to compare.
  **Response:** 200 OK  
  ```json
  {
      "betterStrategy": "A"
  }
  ```

### Health Check
- **GET /api/health**  
  Checks the health status of the application.
  **Response:** 200 OK  
  ```json
  {
      "status": "ok",
      "uptime": 1000,
      "memoryUsage": { ... }
  }
  ```

## Environment Variables
| Variable                    | Description                              | Default Value                       |
|-----------------------------|------------------------------------------|------------------------------------|
| REACT_APP_API_BASE_URL      | Base URL for the API                     | `http://localhost:3000`            |
| PORT                        | Port for the server                      | `3000`                             |
| NODE_ENV                    | Environment type (development/production)| `development`                      |
| STRATEGY_SERVICE_URL        | URL for the strategy service health check| `http://localhost:3001/api/health`|
| DB_URL                      | MongoDB connection string                | `mongodb://mongo:27017/analytics-panel`|
| LOG_LEVEL                   | Logging level (debug/info/warn/error)   | `debug`                            |

## Development Guide
- Follow the [Contributing Guidelines](CONTRIBUTING.md) for contributions.
- Use `npm test` to run tests locally.

## Deployment Guide
For deployment in a production environment, consider using Docker containers for both the application and MongoDB. Configure environment variables and ensure proper logging and monitoring mechanisms are in place.

## License
This project is licensed under the MIT License.

## Change Log
- Updated to include detailed API documentation.
- Refined setup instructions for clarity.
- Added detailed environment variable descriptions.