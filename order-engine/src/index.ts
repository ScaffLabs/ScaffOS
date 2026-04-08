import express from 'express';
import bodyParser from 'body-parser';
import { healthCheck, readyCheck } from './health';
import { orderRouter } from './orderController';
import { migrateData } from './migrations';
import { setupGracefulShutdown } from './shutdown';
import { setupRequestQueue } from './requestQueue';
import { monitorMemoryUsage } from './memoryMonitor';
import { setupConnectionPooling } from './db';
import { errorHandlingMiddleware } from './middleware';
import { logRequest } from './logger';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({ origin: ['http://allowed-origin.com'] }));
app.use(bodyParser.json());
app.use(logRequest); // Add logging middleware

app.get('/health', healthCheck);
app.get('/ready', readyCheck);
orderRouter(app);

const startServer = async () => {
    await migrateData();
    await setupConnectionPooling();
    setupRequestQueue(app);
    setupGracefulShutdown();
    monitorMemoryUsage();
    app.use(errorHandlingMiddleware);
    app.listen(PORT, () => {
        logger.info(`Order Engine listening on port ${PORT}`);
    });
};

startServer().catch(err => {
    logger.error('Failed to start the server:', err);
    process.exit(1);
});