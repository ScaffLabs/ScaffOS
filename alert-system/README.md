# Alert System

## Project Description
The Alert System is a service designed to monitor and notify users of specific conditions in real-time, such as price thresholds and risk levels. It uses an event-driven architecture to process alerts and notify users via configured channels.

## Architecture Overview
The Alert System is built using Node.js and Express. It follows a microservices architecture where:
- **AlertController** manages alert creation and retrieval.
- **AlertProcessor** processes incoming data to evaluate alerts.
- **EventBus** handles event publication and subscription.
- **AlertStore** acts as the in-memory data store for alerts.

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
- **Path**: `/alerts`
- **Response**: `200 OK` with a JSON array of active alerts.

### Create Alert
- **Method**: `POST`
- **Path**: `/alerts`
- **Request Body**: `{ "type": "string", "threshold": "number", "currentValue": "number" }`
- **Response**: `201 Created` with the created alert.

### Update Alert
- **Method**: `PUT`
- **Path**: `/alerts/:id`
- **Request Body**: `{ "threshold": "number" }`
- **Response**: `200 OK` with the updated alert.

### Delete Alert
- **Method**: `DELETE`
- **Path**: `/alerts/:id`
- **Response**: `204 No Content` if successful.

## Environment Variables
| Variable       | Description                         |
|----------------|-------------------------------------|
| NODE_ENV       | Environment for the application (dev/prod) |
| PORT           | Port on which to run the server (default: 3000) |

## Development Guide
To run tests, use:
```bash
npm test
```

## Deployment Guide
For production deployment, consider using Docker or a cloud service provider like AWS or Heroku. Ensure to set environment variables appropriately.

## Contributing
Please refer to the `CONTRIBUTING.md` file for guidelines on contributing to this project.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

## Changelog
### [1.0.1] - 2023-10-15
- Added comprehensive README documentation including project description, architecture overview, setup instructions, API reference, and guides for development and deployment.
- Improved error handling and logging in the Alert System.