import logger from './logger';
import { Pool } from 'mysql';

export const shutdownGracefully = (server: any, pool: Pool) => {
    logger.info('Shutting down gracefully...');
    pool.end(err => {
        if (err) {
            logger.error('Error closing database connections', { error: err.message });
            process.exit(1);
        }
        server.close(() => {
            logger.info('Closed out remaining connections.');
            process.exit(0);
        });
    });
};

process.on('SIGTERM', () => shutdownGracefully(server, pool));
process.on('SIGINT', () => shutdownGracefully(server, pool));
