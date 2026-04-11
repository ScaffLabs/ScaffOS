import { Server } from 'http';
import logger from './logger';
import { createConnectionPool } from './database';

const initGracefulShutdown = (server: Server, connectionPool: ReturnType<typeof createConnectionPool>) => {
    const shutdown = async () => {
        logger.info('Shutting down gracefully...');
        try {
            await connectionPool.drain(); // Close DB connections
            server.close(() => {
                logger.info('Server shutdown completed.');
                process.exit(0);
            });
        } catch (err) {
            logger.error('Error during shutdown', { error: err.message });
            process.exit(1);
        }
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
};

export { initGracefulShutdown }; 