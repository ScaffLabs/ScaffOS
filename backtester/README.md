# Backtester Service

## Project Description
The Backtester service allows users to simulate trading strategies based on historical data. It performs backtests by analyzing trades and generating performance metrics, enabling users to evaluate their trading strategies' effectiveness before committing real capital.

## Architecture Overview
The service is built using Node.js and Express, structured to handle API requests for backtesting strategies. It utilizes an in-memory store for quick data access and supports external service calls for fetching orders and historical data. The service is designed with scalability and reliability in mind, employing patterns such as circuit breakers and retries for external service calls.

## Setup Instructions
### Prerequisites
- Node.js (version 14 or higher)
- npm (Node package manager)

### Install
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd backtester
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Run
To start the service in development mode:
```bash
npm run dev
```

To build and start the service:
```bash
npm run build
npm start
```

## API Reference
### Backtest
- **POST /api/backtest**
  - **Request Body:**
    ```json
    {
      "strategyParams": {
        "slippage": 0.01,
        "buyThreshold": 0.5,
        "sellThreshold": 0.5
      },
      "historicalData": [
        { "timestamp": 1620000000, "price": 100 },
        { "timestamp": 1620000060, "price": 101 }
      ]
    }
    ```
  - **Response:**
    - **201 Created**
      ```json
      {
        "id": "<backtest-id>",
        "result": {
          "totalReturns": 1,
          "trades": 1,
          "winRate": 100,
          "performanceMetrics": "Simulated 1 trades with a win rate of 100"
        }
      }
      ```
    - **400 Bad Request** if input is invalid.

### Get Backtest Result
- **GET /api/backtest/:id**
  - **Response:**
    - **200 OK**
      ```json
      {
        "id": "<backtest-id>",
        "strategyParams": { ... },
        "historicalData": [ ... ],
        "result": { ... }
      }
      ```
    - **404 Not Found** if the result does not exist.

## Environment Variables
| Variable              | Description                          |
|-----------------------|--------------------------------------|
| `PORT`                | Port for the service to listen on.  |
| `NODE_ENV`            | Environment (development/production) |
| `ORDER_SERVICE_URL`   | URL for the order service.          |
| `DATA_SERVICE_URL`    | URL for the data service.           |
| `DATABASE_URL`        | Database connection string.         |
| `LOG_LEVEL`           | Logging level (info, warn, error). |

## Development Guide
- Use `npm run test` to run tests.
- Follow code guidelines for writing services and tests.

## Deployment Guide
- Ensure production environment variables are set.
- Use Docker for containerization:
  ```bash
  docker-compose up --build
  ```

## Contributing
We welcome contributions! To contribute:
1. Fork the repository.
2. Create a new branch for your feature.
3. Make your changes and commit them.
4. Push your branch and open a pull request.

## Changelog
- **1.0.0** - Initial release.
- **1.0.1** - Added comprehensive documentation including API reference, development and deployment guides.
- **1.1.0** - Enhanced error handling and logging for better tracking of issues.
- **1.1.1** - Updated documentation to include detailed contribution guidelines.