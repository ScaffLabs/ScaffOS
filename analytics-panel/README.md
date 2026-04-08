# Analytics Panel

## Project Description
The Analytics Panel is a web application designed to provide performance metrics and strategy comparison tools for analyzing trading strategies. It features a user-friendly interface to visualize data and manage strategies effectively.

## Architecture Overview
The application is structured with React for the frontend and Express for the backend, interacting with a MongoDB database for storing and retrieving strategy data. Major components include health checks, strategy management, and performance metrics fetching.

## Setup Instructions
### Prerequisites
- Node.js (v14 or later)
- MongoDB (local or hosted)
- Docker (optional)

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
1. Start the application:
   ```bash
   npm start
   ```
2. Access the application at `http://localhost:3000`.

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

### Strategy Management
- **Method**: GET
- **Path**: `/api/strategies`
- **Query Parameters**: `limit`, `offset`, `name`
- **Response**: `200 OK`
```json
[
    { "name": "Strategy A" },
    { "name": "Strategy B" }
]
```

- **Method**: POST
- **Path**: `/api/strategies`
- **Request Body**: `{ "name": "string", "parameters": { ... } }`
- **Response**: `201 Created`
```json
{
    "id": "strategyId",
    "name": "Strategy A",
    "parameters": { ... }
}
```

- **Method**: PUT
- **Path**: `/api/strategies/:id`
- **Request Body**: `{ "name": "string", "parameters": { ... } }`
- **Response**: `200 OK`
```json
{
    "id": "strategyId",
    "name": "Strategy A",
    "parameters": { ... }
}
```

- **Method**: DELETE
- **Path**: `/api/strategies/:id`
- **Response**: `204 No Content`

### Health Check
- **Method**: GET
- **Path**: `/api/health`
- **Response**: `200 OK`
```json
{
    "status": "ok",
    "uptime": <uptime in seconds>,
    "memoryUsage": {
        "rss": <rss memory>,
        "heapTotal": <total heap>,
        "heapUsed": <used heap>
    },
    "timestamp": "2023-10-01T12:00:00Z"
}
```

## Environment Variables
| Variable                    | Description                              | Default Value                       |
|-----------------------------|------------------------------------------|------------------------------------|
| REACT_APP_API_BASE_URL      | Base URL for the API                     | `http://localhost:3000`            |
| PORT                        | Port for the server                      | `3000`                             |
| NODE_ENV                    | Environment type (development/production)| `development`                      |
| STRATEGY_SERVICE_URL        | URL for the strategy service health check| `http://localhost:3001/api/health`|

## Development Guide
### Running Tests
To run the tests, use:
```bash
npm test
```

### Linting
To lint the code, use:
```bash
npm run lint
```

## Deployment Guide
To deploy the application:
1. Build the application:
   ```bash
   npm run build
   ```
2. Configure the production environment variables.
3. Use Docker for containerization if needed.

## Contributing
Please read the [CONTRIBUTING.md](./CONTRIBUTING.md) file for guidelines on contributing to this project.

## License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.