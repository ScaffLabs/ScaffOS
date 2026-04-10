## Environment Variables
| Variable            | Description                            |
|---------------------|----------------------------------------|
| JWT_SECRET          | Secret key for JWT signing             |
| EVENT_BUS_URL       | URL for the event bus service          |
| ANOTHER_SERVICE_URL  | URL for another dependent service      |
| NODE_ENV            | Environment type (development/production) |
| PORT                | Server port number                     |

## Development Guide
- Use `npm test` to run tests.
- Use `npm run test:watch` for running tests in watch mode.
- Ensure to have the .env file set up for local development with the necessary environment variables.