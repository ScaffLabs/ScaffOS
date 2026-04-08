import { setInterval } from 'timers';
import logger from './logger';

export const monitorMemoryUsage = () => {
    setInterval(() => {
        const memoryUsage = process.memoryUsage();
        logger.info(`Memory Usage: RSS ${memoryUsage.rss} - Heap Total ${memoryUsage.heapTotal} - Heap Used ${memoryUsage.heapUsed}`);
    }, 60000);
};
