# Analytics Panel

## Project Description
The Analytics Panel is a React application that provides tools for analyzing trading strategies. It features performance metrics visualization, strategy comparison tools, and system health checks.

## Architecture Overview
The application is structured into components that handle different aspects of the analytics process. It utilizes a REST API to fetch data and display it to the user.

## Setup Instructions

### Prerequisites
- Node.js (>=14.0)
- npm (>=6.0)

### Install
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd analytics-panel
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Run
1. Start the development server:
   ```bash
   npm start
   ```
2. Open your browser and navigate to `http://localhost:3000`.

## API Reference

### Performance Metrics
- **Method**: GET
- **Path**: `/api/performance`
- **Response**: `200 OK`
  ```json
  {
      "drawdown": [10, 20, 30],
      "maxDrawdown": 30,
      "sharpeRatio": 1.5
  }
  ```

### Strategy Comparison
- **Method**: GET
- **Path**: `/api/compare`
- **Request Body**: `{ "strategyA": "string", "strategyB": "string" }`
- **Response**: `200 OK`
  ```json
  {
      "betterStrategy": "A"
  }
  ```

### Health Check
- **Method**: GET
- **Path**: `/api/health`
- **Response**: `200 OK`
  ```json
  {
      "status": "ok",
      "timestamp": "2023-10-01T12:00:00Z"
  }
  ```

## Environment Variables Table
| Variable                | Description                           |
|-------------------------|---------------------------------------|
| `REACT_APP_API_BASE_URL` | Base URL for the API (default: `http://localhost:3000`) |
| `PORT`                  | Port for the server (default: `3000`) |

## Development Guide
- To add a new feature, create a new component in `src/components/`.
- Ensure you follow the existing structure and best practices.

## Deployment Guide
- Build the application using `npm run build`.
- Deploy the contents of the `build` folder on your preferred hosting service.

## Contributing
Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details on contributing.

## Changelog
See [CHANGELOG.md](./CHANGELOG.md) for version history.