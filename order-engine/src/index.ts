import express from 'express';
import bodyParser from 'body-parser';
import { healthCheck, readyCheck } from './health';
import { orderRouter } from './orderController';
import { migrateData } from './migrations';
import { setupGracefulShutdown } from './shutdown';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { requestIdMiddleware, errorHandlingMiddleware } from './middleware';
import logger from './logger';
import { sanitize } from 'express-validator';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({ origin: ['http://allowed-origin.com', 'http://another-allowed-origin.com'] }));
app.use(bodyParser.json({ limit: '1mb' }));
app.use(requestIdMiddleware);
app.use(logger.logRequest);

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// Sanitize input for all routes
app.use((req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            req.body[key] = sanitize(req.body[key]);
        });
    }
    next();
});

app.get('/health', healthCheck);
app.get('/ready', readyCheck);
orderRouter(app);

const startServer = async () => {
    await migrateData();
    setupGracefulShutdown(app);
    const server = app.listen(PORT, () => {
        logger.logStartup({ port: PORT });
        console.log(`Order Engine listening on port ${PORT}`);
    });
    return server;
};

startServer().catch(err => {
    logger.error('Failed to start server:', err);
    process.exit(1);
});

app.use(errorHandlingMiddleware);