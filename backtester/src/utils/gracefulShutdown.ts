import { logger } from './logger';

const gracefulShutdown = async (server) => {
    logger.info('Shutting down gracefully...');
    await new Promise(resolve => server.close(resolve));
    logger.info('Server closed');
    process.exit(0);
};

export { gracefulShutdown };