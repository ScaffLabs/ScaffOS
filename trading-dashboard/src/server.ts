import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { healthCheck, gracefulShutdown, registerShutdownHandlers } from './utils/healthCheck';
import errorHandler from './middleware/errorHandler';
import requestLogger from './middleware/requestLogger';
import { registerRoutes } from './api/portfolioApi';
import logger from './utils/logger';
import config from './config';
import { csrfMiddleware, getCsrfToken } from './middleware/csrfProtection';

const app = express();

logger.logStartup(config);
app.use(helmet());
app.use(cors());

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.',
});
app.use(limiter);

app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);
app.get('/api/health', healthCheck);
app.get('/api/csrf-token', getCsrfToken);

registerRoutes(app);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});

registerShutdownHandlers(server);

export default app;
