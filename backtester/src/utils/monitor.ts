import { logger } from './logger';

const monitorMemoryUsage = () => {
    setInterval(() => {
        const used = process.memoryUsage();
        const total = used.heapTotal + used.external;
        logger.info(`Memory Usage: Heap Total: ${Math.round(used.heapTotal / 1024 / 1024)} MB, Heap Used: ${Math.round(used.heapUsed / 1024 / 1024)} MB, External: ${Math.round(used.external / 1024 / 1024)} MB, Total: ${Math.round(total / 1024 / 1024)} MB`);
    }, 60000); // Log memory usage every minute
};

const gracefulShutdown = async (server) => {
    logger.info('Shutting down gracefully...');
    await new Promise(resolve => server.close(resolve));
    logger.info('Server closed');
    process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown);
process.on('SIGINT', () => gracefulShutdown);

export { monitorMemoryUsage, gracefulShutdown };