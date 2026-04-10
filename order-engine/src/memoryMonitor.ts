import { config } from './config';
import logger from './logger';

const MEMORY_CHECK_INTERVAL = 5000;
const MEMORY_WARN_THRESHOLD = parseFloat(config.MEMORY_LIMIT) * 0.01;

setInterval(() => {
    const memoryUsage = process.memoryUsage();
    const currentMemoryUsage = memoryUsage.heapUsed / memoryUsage.heapTotal;
    console.log(`Memory Usage: RSS: ${memoryUsage.rss}, Heap Total: ${memoryUsage.heapTotal}, Heap Used: ${memoryUsage.heapUsed}`);

    if (currentMemoryUsage > MEMORY_WARN_THRESHOLD) {
        logger.warn('Memory usage is high! Consider optimizing.');
    }
}, MEMORY_CHECK_INTERVAL);

const handleMemoryUsage = () => {
    const memoryUsage = process.memoryUsage();
    if (memoryUsage.heapUsed / memoryUsage.heapTotal > MEMORY_WARN_THRESHOLD) {
        logger.error('Memory usage exceeds limit!');
    }
};

process.on('exit', handleMemoryUsage);
process.on('SIGINT', handleMemoryUsage);
process.on('SIGTERM', handleMemoryUsage);
