import express from 'express';
import http from 'http';
import helmet from 'helmet';
import logger, { requestLogger, errorLogger } from './services/logger';
import healthRoutes from './routes/healthRoutes';
import portfolioRoutes from './routes/portfolioRoutes';
import env from './config';
import { createConnectionPool, closeConnectionPool } from './services/connectionPool';
import { monitorMemoryUsage } from './services/memoryMonitor';
import { shutdownGracefully } from './services/shutdownService';

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(express.json({ limit: '1mb' })); // Limit request size to 1MB
app.use(requestLogger);

app.use('/api/portfolios', portfolioRoutes);
app.use('/api', healthRoutes);
app.use(errorLogger);

const pool = createConnectionPool();

const PORT = env.PORT;
server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});

process.on('SIGTERM', () => shutdownGracefully(server, pool));
process.on('SIGINT', () => shutdownGracefully(server, pool));

setInterval(monitorMemoryUsage, 60000); // Monitor memory usage every minute

export const shutdownGracefully = (server, pool) => {
    logger.info('Shutting down gracefully...');
    closeConnectionPool(pool);
    server.close(() => {
        logger.info('Closed out remaining connections.');
        process.exit(0);
    });
};