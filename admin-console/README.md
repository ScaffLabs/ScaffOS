# Admin Console

## Project Description
The Admin Console is a web application for managing system health and configurations. It provides a user-friendly interface to monitor various services and manage their settings.

## Architecture Overview
The application is built using React and uses React Router for navigation. It communicates with backend services via RESTful APIs, ensuring a modular and scalable architecture.

## Setup Instructions
### Prerequisites
- Node.js (v16 or higher)
- npm (v6 or higher)

### Install
1. Clone the repository.
2. Navigate to the project directory.
3. Run `npm install` to install dependencies.

### Run
- To start the application, run `npm start`. It will run on `http://localhost:3000`.

## API Reference
### Health Check Endpoint
- **Method**: GET
- **Path**: `/api/health`
- **Request Body**: None
- **Response**:
  - **200 OK**: Returns the health status of services.
  - **500 Internal Server Error**: If there's an issue fetching the status.

### Configuration Management Endpoint
- **Method**: POST
- **Path**: `/api/config`
- **Request Body**:
  ```json
  {
    "key": "string",
    "value": "string"
  }
  ```
- **Response**:
  - **201 Created**: Configuration created successfully.
  - **400 Bad Request**: If the request body is invalid.

## Environment Variables Table
| Variable        | Description                      | Default Value         |
|------------------|----------------------------------|-----------------------|
| PORT             | Port to run the application      | 3000                  |
| NODE_ENV         | Environment mode                 | development           |
| DATABASE_URL     | Database connection string       | your_database_url_here|
| API_KEY          | API authentication key           | your_api_key_here     |

## Development Guide
- For development, use `npm run dev` to start the application with hot reloading.
- Ensure you have the environment variables set up in a `.env` file.

## Deployment Guide
- Use Docker for containerization. Build the application with `docker-compose up --build`.
- Ensure the database service is running before starting the application.

## Contributing
Please read the [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.