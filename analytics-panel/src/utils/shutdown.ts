import { Server } from 'http';
import logger from '../logger';

export const gracefulShutdown = (server: Server, monitorInterval: NodeJS.Timeout) => {
    console.log('Received shutdown signal. Gracefully shutting down...');
    clearInterval(monitorInterval); // Clear the memory monitoring interval
    server.close(async () => {
        logger.info('Closed all connections.');
        // Optionally add any cleanup logic here (e.g., closing database connections)
        process.exit(0);
    });
    // Force close server after 10 seconds
    setTimeout(() => {
        console.error('Forcing shutdown...');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown(server));
process.on('SIGINT', () => gracefulShutdown(server));
