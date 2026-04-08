import { Server } from 'http';
import logger from '../logger';

export const gracefulShutdown = (server: Server) => {
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
