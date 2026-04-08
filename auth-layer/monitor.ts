import { setInterval } from 'timers';

export const monitorMemoryUsage = () => {
    setInterval(() => {
        const memoryUsage = process.memoryUsage();
        console.log(`Memory Usage: RSS ${memoryUsage.rss} - Heap Total ${memoryUsage.heapTotal} - Heap Used ${memoryUsage.heapUsed}`);
    }, 60000); // Log every minute
};
