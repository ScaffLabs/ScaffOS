// Import the new handler at the top
import { getStrategiesHandler } from './handlers/strategyHandler';

// ... other imports and middleware

// Register the new endpoint
app.get('/api/strategies', getStrategiesHandler);