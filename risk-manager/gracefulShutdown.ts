import logger from './logger';
import { Pool } from 'mysql2/promise';

const gracefulShutdown = async (dbPool: Pool) => {
    logger.info('Shutting down gracefully...');
    await dbPool.end(); // Close the database connection pool
    logger.info('Database connection pool closed.');
    process.exit(0);
};

export default gracefulShutdown;
