import { logPerformance } from '../logger';

export const monitorMemoryUsage = () => {
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.rss + memoryUsage.heapTotal + memoryUsage.heapUsed;
    const usedMemory = memoryUsage.heapUsed;
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;
    logPerformance('Memory Usage', memoryUsagePercent);
    console.log(`Memory Usage: ${memoryUsagePercent.toFixed(2)}%`);
};