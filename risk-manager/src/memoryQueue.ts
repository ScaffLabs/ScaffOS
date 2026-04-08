import { EventEmitter } from 'events';

const MAX_QUEUE_SIZE = 100;
const QUEUE_CHECK_INTERVAL = 5000;
const TIMEOUT_DURATION = 5000; // 5 seconds

class MemoryQueue {
    private queue: any[] = [];
    private eventEmitter: EventEmitter;

    constructor() {
        this.eventEmitter = new EventEmitter();
        setInterval(this.monitorMemoryUsage.bind(this), QUEUE_CHECK_INTERVAL);
    }

    enqueue(item: any) {
        if (this.queue.length >= MAX_QUEUE_SIZE) {
            console.warn('Queue is full. Dropping item.');
            return;
        }
        this.queue.push(item);
        this.eventEmitter.emit('itemAdded', item);
    }

    dequeue(timeout: number = TIMEOUT_DURATION): Promise<any> {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('Request timed out'));
            }, timeout);

            const item = this.queue.shift();
            clearTimeout(timeoutId);
            resolve(item);
        });
    }

    private monitorMemoryUsage() {
        const memoryUsage = process.memoryUsage();
        console.log(`Memory Usage: RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`);
    }
}

export default new MemoryQueue();