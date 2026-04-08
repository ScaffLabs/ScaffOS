import { memoryUsage } from 'process';

export class MemoryMonitor {
    public logMemoryUsage() {
        const used = memoryUsage();
        console.log(`Memory Usage: RSS ${used.rss / 1024 / 1024} MB, Heap Total ${used.heapTotal / 1024 / 1024} MB, Heap Used ${used.heapUsed / 1024 / 1024} MB`);
    }
}