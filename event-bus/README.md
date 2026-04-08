# Event Bus Service

## Project Description
The Event Bus service is a lightweight, scalable event-driven architecture that enables applications to communicate through events. It facilitates the creation, retrieval, updating, and deletion of events while leveraging Redis as a message broker.

## Architecture Overview
This service is built using Express.js and connects to Redis for event publishing and subscribing. The application utilizes in-memory storage for event management and implements validation using Zod. Rate limiting is applied to prevent abuse of the endpoints.

## Setup Instructions
### Prerequisites
- Node.js (v16 or higher)
- Redis server running locally or accessible via a URL

### Install
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd event-bus
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Run
- Start the service:
  ```bash
  npm start
  ```

## API Reference
### Create Event
- **Method**: POST
- **Path**: /events
- **Request Body**:
  ```json
  {
    "title": "Event Title",
    "description": "Event Description",
    "type": "userCreated"
  }
  ```
- **Response**:
  - **201**: Event created successfully
  - **400**: Validation error

### Get Events
- **Method**: GET
- **Path**: /events
- **Response**:
  - **200**: A list of events
  - **404**: No events found

### Update Event
- **Method**: PUT
- **Path**: /events/:id
- **Request Body**:
  ```json
  {
    "title": "Updated Title"
  }
  ```
- **Response**:
  - **200**: Event updated successfully
  - **404**: Event not found

### Delete Event
- **Method**: DELETE
- **Path**: /events/:id
- **Response**:
  - **204**: Event deleted successfully
  - **404**: Event not found

### Health Check
- **Method**: GET
- **Path**: /events/health
- **Response**:
  - **200**: Service is healthy
  - **503**: Service is unhealthy

## Environment Variables
| Variable         | Description                       |
|------------------|-----------------------------------|
| NODE_ENV         | Environment (development/production)|
| PORT             | Port number for the service       |
| LOG_LEVEL        | Log level for Winston             |
| REDIS_URL        | URL for the Redis server          |
| OTHER_SERVICE_URL| URL for external service to check health |

## Development Guide
- Ensure all tests are passing before submitting changes.
- Follow the existing coding style and conventions.

## Deployment Guide
- Use Docker for containerization to deploy the service.
- Ensure Redis is accessible from the deployed environment.

## Contributing
See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## Changelog
See [CHANGELOG.md](./CHANGELOG.md) for version history.