import express from 'express';
import bodyParser from 'body-parser';
import { healthCheck, readyCheck } from './health';
import { orderRouter } from './orderController';
import { migrateData } from './migrations';
import { setupGracefulShutdown } from './shutdown';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import logger, { logStartup } from './logger';
import { sanitizeInput } from './sanitization';
import { config } from './config';

const app = express();
const PORT = config.PORT;

// Middleware
app.use(helmet());
app.use(cors({ origin: ['http://allowed-origin.com', 'http://another-allowed-origin.com'] }));
app.use(bodyParser.json({ limit: '1mb' }));
app.use(sanitizeInput);
app.use(logger.logRequest);

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

app.get('/health', healthCheck);
app.get('/ready', readyCheck);
orderRouter(app);

const startServer = async () => {
    await migrateData();
    setupGracefulShutdown(app);
    const server = app.listen(PORT, () => {
        logStartup({ port: PORT, env: config.NODE_ENV });
        console.log(`Order Engine listening on port ${PORT}`);
    });
    return server;
};

startServer().catch(err => {
    logger.error('Failed to start server:', err);
    process.exit(1);
});

app.use(errorHandlingMiddleware);