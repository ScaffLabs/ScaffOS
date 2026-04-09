import { setInterval } from 'timers';
import logger from './logger';

export const monitorMemoryUsage = () => {
    setInterval(() => {
        const memoryUsage = process.memoryUsage();
        const totalMemory = memoryUsage.rss + memoryUsage.heapTotal + memoryUsage.heapUsed;
        logger.info(`Memory Usage: RSS ${memoryUsage.rss} - Heap Total ${memoryUsage.heapTotal} - Heap Used ${memoryUsage.heapUsed} - Total Memory: ${totalMemory}`);
    }, 60000);
};