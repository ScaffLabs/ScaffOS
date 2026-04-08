import express from 'express';
import { healthCheckHandler } from './handlers/healthCheck';
import { dependentHealthCheckHandler } from './handlers/dependentHealthCheck';
import { auditLogger } from './middleware/auditLogger';
import { validateQueryParams } from './middleware/inputValidator';

const app = express();
app.use(express.json());
app.use(auditLogger);

// Health check endpoints
app.get('/api/health', healthCheckHandler);
app.get('/api/dependent-health', dependentHealthCheckHandler);

// ... other routes and middleware registrations

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});