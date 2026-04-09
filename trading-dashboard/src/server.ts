import express from 'express';
import { securityMiddleware, validateAndLog, validatePositionInput } from './middleware/securityMiddleware';
import { registerHealthRoutes, gracefulShutdown, registerShutdownHandlers } from './utils/healthCheck';
import errorHandler from './middleware/errorHandler';
import requestLogger from './middleware/requestLogger';
import { registerRoutes } from './api/portfolioApi';
import { registerExternalApiRoutes } from './api/externalApi';
import logger from './utils/logger';
import config from './config';

const app = express();

logger.logStartup(config);
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);

// Apply security middleware
securityMiddleware(app);

registerHealthRoutes(app);
registerRoutes(app);
registerExternalApiRoutes(app);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});

registerShutdownHandlers(server);

export default app;