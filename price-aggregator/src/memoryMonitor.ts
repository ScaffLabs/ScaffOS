import { memoryUsage } from 'process';
import { setInterval } from 'timers';
import { logPerformance } from './logger';

export class MemoryMonitor {
    public logMemoryUsage() {
        const used = memoryUsage();
        const memoryInfo = {
            rss: used.rss / 1024 / 1024,
            heapTotal: used.heapTotal / 1024 / 1024,
            heapUsed: used.heapUsed / 1024 / 1024,
        };
        logPerformance('Memory Usage', memoryInfo);
    }
}

setInterval(() => {
    const monitor = new MemoryMonitor();
    monitor.logMemoryUsage();
}, 60000); // Log memory usage every minute.