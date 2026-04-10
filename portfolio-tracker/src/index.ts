import express from 'express';
import http from 'http';
import helmet from 'helmet';
import logger, { requestLogger, errorLogger } from './services/logger';
import healthRoutes from './routes/healthRoutes';
import portfolioRoutes from './routes/portfolioRoutes';
import env from './config';

const app = express();
const server = http.createServer(app);

app.use(helmet()); // Protects against well-known vulnerabilities by setting HTTP headers
app.use(express.json());
app.use(requestLogger); // Use the request logger middleware
app.use('/api/portfolios', portfolioRoutes);
app.use('/api', healthRoutes);
app.use(errorLogger); // Use the error logger middleware

const shutdown = (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
        logger.info('Closed out remaining connections.');
        process.exit(0);
    });
    setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

const PORT = env.PORT;
server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});