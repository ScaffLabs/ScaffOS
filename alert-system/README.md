# Alert System

## Project Description
The Alert System is a robust service designed to monitor and notify users of specific conditions in real-time, such as price thresholds and risk levels. It utilizes an event-driven architecture to process alerts and notify users via configured channels, ensuring timely responses to critical situations.

## Architecture Overview
The Alert System leverages Node.js and Express, organized under a microservices architecture. The key components of the system include:
- **AlertController**: Handles the creation, retrieval, updating, and deletion of alerts.
- **AlertProcessor**: Processes incoming data to evaluate alerts and communicate with external services.
- **EventBus**: Manages event publication and subscription, facilitating communication between components.
- **AlertStore**: Serves as the in-memory data store for alerts, providing CRUD operations.

## Setup Instructions
### Prerequisites
- Node.js (v12 or above)
- npm (Node package manager)

### Install
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd alert-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Run
To start the server, run:
```bash
npm start
```
The server will be running on port 3000.

## API Reference
### Get Active Alerts
- **Method**: `GET`
- **Path**: `/api/alerts`
- **Response**: `200 OK` with a JSON array of active alerts.

### Create Alert
- **Method**: `POST`
- **Path**: `/api/alerts`
- **Request Body**: `{ "type": "string", "threshold": "number", "currentValue": "number" }`
- **Response**: `201 Created` with the created alert.

### Update Alert
- **Method**: `PUT`
- **Path**: `/api/alerts/:id`
- **Request Body**: `{ "threshold": "number" }`
- **Response**: `200 OK` with the updated alert.

### Delete Alert
- **Method**: `DELETE`
- **Path**: `/api/alerts/:id`
- **Response**: `204 No Content` if successful.

## Environment Variables
| Variable       | Description                         |
|----------------|-------------------------------------|
| NODE_ENV       | Environment for the application (dev/prod) |
| PORT           | Port on which to run the server (default: 3000) |
| WEBHOOK_URL    | URL for webhook notifications |
| EMAIL_SERVICE_URL | URL for email service notifications |
| MONGO_URI      | MongoDB connection string |

## Development Guide
### Running Tests
To run tests, use:
```bash
npm test
```

## Deployment Guide
For production deployment, consider using Docker or a cloud service provider like AWS or Heroku. Ensure to set environment variables appropriately based on your environment.

## Contributing
Please refer to the `CONTRIBUTING.md` file for guidelines on contributing to this project.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

## Changelog
### [1.0.4] - 2023-10-21
- Added comprehensive README documentation including setup instructions, API reference, and development guide.
- Introduced deployment guide for better production readiness.