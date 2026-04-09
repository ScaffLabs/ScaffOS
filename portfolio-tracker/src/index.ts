import express from 'express';
import { json } from 'body-parser';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { connectToEventBus } from './eventBus';
import portfolioRoutes from './routes/portfolioRoutes';
import healthRoutes from './routes/healthRoutes';
import logger, { requestLogger, errorLogger } from './services/logger';
import http from 'http';
import errorHandler from './middleware/errorHandler';
import csrfMiddleware from './middleware/csrfProtection';
import { sanitize } from './middleware/sanitization';
import auditLogger from './middleware/auditLogger';

const app = express();

app.use(cors({ origin: 'https://your-allowed-origin.com' }));
app.use(helmet());
app.use(json());
app.use(requestLogger);
app.use(auditLogger);
app.use(errorLogger);
app.use(sanitize);

// Rate limiting middleware for the entire app
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use(limiter);

// Routes
app.use('/api/portfolios', csrfMiddleware, portfolioRoutes);
app.use('/api/health', healthRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(PORT, () => {
    logger.info(`Portfolio Tracker service running on port ${PORT}`);
});

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));