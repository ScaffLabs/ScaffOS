import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { limiter } from './middleware/rateLimiter';
import { healthCheck } from './utils/healthCheck';
import errorHandler from './middleware/errorHandler';
import requestLogger from './middleware/requestLogger';
import { registerRoutes } from './api/portfolioApi';
import logger from './utils/logger';
import config from './config';
import { healthCheck as externalHealthCheck } from './api/externalApi';
import { csrfMiddleware, getCsrfToken } from './middleware/csrfProtection';
import validator from 'validator';

const app = express();

logger.logStartup(config);
app.use(helmet());
app.use(cors({ origin: ['http://your-allowed-origin.com'], optionsSuccessStatus: 200 }));
app.use(limiter); // Apply rate limiter
app.use(express.json({ limit: '1mb' })); // Set request size limit
app.use(requestLogger);
app.get('/api/health', healthCheck);
app.get('/api/external-health', externalHealthCheck);
app.get('/api/csrf-token', getCsrfToken); // CSRF token endpoint

// Input validation middleware
app.use((req, res, next) => {
    const { quantity } = req.body;
    if (quantity && (typeof quantity !== 'number' || quantity <= 0)) {
        return res.status(400).json({ message: 'Invalid quantity' });
    }
    next();
});

registerRoutes(app);
app.use(errorHandler);
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;