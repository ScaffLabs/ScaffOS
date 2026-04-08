import express from 'express';
import http from 'http';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { healthCheckHandler } from './handlers/healthCheck';
import { validateQueryParams } from './middleware/inputValidator';
import { fetchComparisonData } from './api/analytics';

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(cors({ origin: ['https://your-allowed-origin.com', 'https://another-allowed-origin.com'] }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' })); // Limit request size

app.get('/api/health', healthCheckHandler);
app.get('/api/compare', validateQueryParams, async (req, res) => {
    const { strategyA, strategyB } = req.query;
    try {
        const result = await fetchComparisonData(strategyA, strategyB);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3000;
let serverInstance;

const gracefulShutdown = () => {
    console.log('Shutting down gracefully...');
    serverInstance.close(() => {
        console.log('Closed all connections.');
        process.exit(0);
    });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

serverInstance = server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});