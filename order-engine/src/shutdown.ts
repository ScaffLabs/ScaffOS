import { closeDatabaseConnection } from './db';

export const setupGracefulShutdown = () => {
  const shutdown = async () => {
    console.log('Initiating graceful shutdown...');
    await closeDatabaseConnection();
    console.log('Database connection closed. Exiting...');
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};
