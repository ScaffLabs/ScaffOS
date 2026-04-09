const shutdown = (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
        logger.info('Closed out remaining connections.');
        connectionPool.close();
        process.exit(0);
    });
    setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};
