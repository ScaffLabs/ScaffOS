## Environment Variables
| Variable            | Description                                     |
|---------------------|-------------------------------------------------|
| JWT_SECRET          | Secret key for signing JWT tokens for authentication. Used to verify user identity and secure routes. |
| EVENT_BUS_URL       | URL for the event bus service to publish and subscribe to events related to risk positions. |
| ANOTHER_SERVICE_URL  | URL for another dependent service that provides additional data or functionality required by this service. |
| NODE_ENV            | Determines the environment in which the application runs (development, staging, production). Helps in logging and configuration management. |
| PORT                | The port on which the service listens for incoming requests. Default is set to 3000.