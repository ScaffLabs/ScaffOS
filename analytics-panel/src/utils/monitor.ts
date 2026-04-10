import { logPerformance } from '../logger';

export const monitorMemoryUsage = () => {
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.rss + memoryUsage.heapTotal + memoryUsage.heapUsed;
    const usedMemory = memoryUsage.heapUsed;
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;
    logPerformance('Memory Usage', memoryUsagePercent);
    console.log(`Memory Usage: ${memoryUsagePercent.toFixed(2)}%`);
};

const checkMemoryUsageThreshold = (threshold = 80) => {
    const memoryUsage = process.memoryUsage();
    const usedMemory = memoryUsage.heapUsed / 1024 / 1024;
    if (usedMemory > threshold) {
        console.warn(`Memory usage exceeded threshold: ${usedMemory.toFixed(2)} MB`);
    }
};

setInterval(() => checkMemoryUsageThreshold(), 60000); // Check every minute
