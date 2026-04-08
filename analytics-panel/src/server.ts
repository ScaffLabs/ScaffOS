import express from 'express';
import { createServer } from 'http';
import strategyRoutes from './routes/strategyRoutes';
import healthRoutes from './routes/healthRoutes';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { logWithRequestId, logStartup } from './logger';
import errorHandler from './middleware/errorHandler';
import config from './config';

const app = express();
const server = createServer(app);

// Middleware setup
app.use(helmet());
app.use(cors({ origin: ['http://example.com', 'http://localhost:3000'] }));
app.use(express.json());
app.use(logWithRequestId);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

app.use('/api/strategies', strategyRoutes);
app.use('/api', healthRoutes);
app.use(errorHandler);

const startServer = async () => {
    const PORT = process.env.PORT || 3000;
    logStartup(config);
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();