import { closeDatabaseConnection } from './db';
import { server } from './index';

export const setupGracefulShutdown = () => {
    const shutdown = async () => {
        console.log('Initiating graceful shutdown...');
        await closeDatabaseConnection();
        console.log('Database connection closed. Exiting...');
        server.close(() => {
            console.log('HTTP server closed.');
            process.exit(0);
        });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
};