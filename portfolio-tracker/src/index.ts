import express from 'express';
import { json } from 'body-parser';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { connectToEventBus } from './eventBus';
import portfolioRoutes from './routes/portfolioRoutes';
import logger from './services/logger';
import http from 'http';

const app = express();
app.use(json({ limit: '1mb' }));
app.use(helmet());
app.use(cors());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));

// Middleware to add request ID
app.use((req, res, next) => {
    req.id = req.headers['x-request-id'] || generateUniqueId();
    next();
});

const generateUniqueId = () => {
    return Math.random().toString(36).substring(2, 15);
};

connectToEventBus();
app.use('/api/portfolios', portfolioRoutes);

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(PORT, () => {
    logger.info(`Portfolio Tracker service running on port ${PORT}`);
});
