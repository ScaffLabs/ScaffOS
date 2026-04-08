import { EventEmitter } from 'events';

interface Message<T> {
    topic: string;
    data: T;
    timestamp: number;
}

class EventBus {
    private emitter: EventEmitter;
    private subscriptions: Record<string, Array<(message: Message<any>) => void>>;
    private connectionRetries: number;
    private maxRetries: number;

    constructor(maxRetries: number = 5) {
        this.emitter = new EventEmitter();
        this.subscriptions = {};
        this.connectionRetries = 0;
        this.maxRetries = maxRetries;
    }

    public subscribe<T>(topic: string, listener: (message: Message<T>) => void): void {
        this.emitter.on(topic, listener);
        this.subscriptions[topic] = this.subscriptions[topic] || [];
        this.subscriptions[topic].push(listener);
    }

    public publish<T>(topic: string, data: T): void {
        const message: Message<T> = { topic, data, timestamp: Date.now() };
        this.emitter.emit(topic, message);
    }

    public unsubscribe<T>(topic: string, listener: (message: Message<T>) => void): void {
        this.emitter.off(topic, listener);
        if (this.subscriptions[topic]) {
            this.subscriptions[topic] = this.subscriptions[topic].filter(l => l !== listener);
        }
    }

    public clearSubscriptions(topic: string): void {
        if (this.subscriptions[topic]) {
            this.subscriptions[topic].forEach(listener => {
                this.emitter.off(topic, listener);
            });
            delete this.subscriptions[topic];
        }
    }

    public getSubscriptionCount(topic: string): number {
        return this.subscriptions[topic] ? this.subscriptions[topic].length : 0;
    }

    public async connect(): Promise<void> {
        while (this.connectionRetries < this.maxRetries) {
            try {
                // Simulating a connection setup
                console.log('Connected to Event Bus');
                return;
            } catch (error) {
                this.connectionRetries++;
                console.error('Connection failed, retrying...', error);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retrying
            }
        }
        throw new Error('Failed to connect to Event Bus after retries');
    }
}

const eventBus = new EventBus();
export default eventBus;