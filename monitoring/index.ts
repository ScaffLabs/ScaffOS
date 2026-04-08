import express from 'express';
import { dashboard, createDashboardEntry, updateDashboardEntry, deleteDashboardEntry, listDashboardEntries } from './dashboard';
import { healthCheck } from './healthCheck';
import errorMiddleware from './errorMiddleware';
import { limiter } from './rateLimiter';
import { latencyTracker } from './latencyTracker';
import { checkServiceHealth } from './serviceHealth';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import { sanitize } from './sanitize';
const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({ origin: ['https://example.com', 'https://another-domain.com'] }));
app.use(limiter);
app.use(bodyParser.json({ limit: '1mb' })); // Set request size limit

app.use(latencyTracker);

app.get('/health', healthCheck);
app.get('/dashboard', listDashboardEntries);
app.post('/dashboard', sanitize, createDashboardEntry);
app.put('/dashboard/:id', sanitize, updateDashboardEntry);
app.delete('/dashboard/:id', deleteDashboardEntry);
app.get('/health/aggregate', checkServiceHealth);
app.use(errorMiddleware);

const gracefulShutdown = () => {
    console.log('Shutting down gracefully...');
    process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
app.listen(PORT, () => {
    console.log(`Monitoring service running on port ${PORT}`);
});