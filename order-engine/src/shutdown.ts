import { closeDatabaseConnection } from './db';
import { server } from './index';

export const setupGracefulShutdown = () => {
    const shutdown = async () => {
        console.log('Initiating graceful shutdown...');
        try {
            await closeDatabaseConnection();
            console.log('Database connection closed.');
        } catch (err) {
            console.error('Error closing database connection:', err);
        }
        server.close(() => {
            console.log('HTTP server closed. Exiting...');
            process.exit(0);
        });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    process.on('uncaughtException', (err) => {
        console.error('Uncaught Exception:', err);
        shutdown();
    });
    process.on('unhandledRejection', (reason) => {
        console.error('Unhandled Rejection:', reason);
        shutdown();
    });
};