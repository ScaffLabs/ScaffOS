import { Server } from 'http';
import logger from '../logger';
import { gracefulShutdown } from './shutdown';

export const initiateGracefulShutdown = (server: Server) => {
    console.log('Received shutdown signal. Gracefully shutting down...');
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

process.on('SIGTERM', () => initiateGracefulShutdown(server));
process.on('SIGINT', () => initiateGracefulShutdown(server));