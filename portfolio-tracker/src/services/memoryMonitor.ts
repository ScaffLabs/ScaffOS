import os from 'os';
import logger from './logger';

export const monitorMemoryUsage = () => {
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    logger.info('Memory Usage Report', {
        totalMemory,
        usedMemory,
        freeMemory,
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
    });
};
