import { config } from './config';
import logger from './logger';

setInterval(() => {
    const memoryUsage = process.memoryUsage();
    console.log(`Memory Usage: RSS: ${memoryUsage.rss}, Heap Total: ${memoryUsage.heapTotal}, Heap Used: ${memoryUsage.heapUsed}`);
    const memoryLimit = parseFloat(config.MEMORY_LIMIT) * 0.01 * memoryUsage.heapTotal;
    if (memoryUsage.heapUsed > memoryLimit) {
        logger.warn('Memory usage is high! Consider optimizing.');
    }
}, 5000);
