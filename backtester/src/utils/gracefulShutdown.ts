import { logger } from './logger';
import { pool } from '../services/healthCheckService'; // Import the connection pool

const gracefulShutdown = async (server) => {
    logger.info('Shutting down gracefully...');
    await new Promise(resolve => server.close(resolve));
    await pool.end(); // Close database connections
    logger.info('Database connections closed.');
    logger.info('Server closed');
    process.exit(0);
};

export { gracefulShutdown };