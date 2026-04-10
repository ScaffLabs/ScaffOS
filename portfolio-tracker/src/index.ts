import express from 'express';
import http from 'http';
import helmet from 'helmet';
import logger, { requestLogger, errorLogger } from './services/logger';
import healthRoutes from './routes/healthRoutes';
import portfolioRoutes from './routes/portfolioRoutes';
import env from './config';
import { createConnectionPool } from './services/connectionPool';

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(express.json());
app.use(requestLogger);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api', healthRoutes);
app.use(errorLogger);

const pool = createConnectionPool();

const shutdown = (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    pool.end(err => {
        if (err) {
            logger.error('Error closing database connections', { error: err.message });
            process.exit(1);
        }
        server.close(() => {
            logger.info('Closed out remaining connections.');
            process.exit(0);
        });
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

const PORT = env.PORT;
server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});