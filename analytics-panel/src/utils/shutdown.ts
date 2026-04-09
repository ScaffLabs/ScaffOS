import { Server } from 'http';
import logger from '../logger';
import mongoose from 'mongoose';

export const gracefulShutdown = (server: Server, monitorInterval: NodeJS.Timeout) => {
    console.log('Received shutdown signal. Gracefully shutting down...');
    clearInterval(monitorInterval); // Clear the memory monitoring interval
    mongoose.connection.close(() => {
        console.log('MongoDB connections closed.');
    });
    server.close(async () => {
        logger.info('Closed all connections.');
        process.exit(0);
    });
    // Force close server after 10 seconds
    setTimeout(() => {
        console.error('Forcing shutdown...');
        process.exit(1);
    }, 10000);
};