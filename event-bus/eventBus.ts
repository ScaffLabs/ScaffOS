import { EventEmitter } from 'events';
import { Message } from './messageSchema';
import logger from './logger';

class EventBus {
    private emitter: EventEmitter;
    private subscriptions: Record<string, Array<(message: Message<any>) => void>>;

    constructor() {
        this.emitter = new EventEmitter();
        this.subscriptions = {};
    }

    public subscribe<T>(topic: string, listener: (message: Message<T>) => void): void {
        this.emitter.on(topic, listener);
        this.subscriptions[topic] = this.subscriptions[topic] || [];
        this.subscriptions[topic].push(listener);
    }

    public publish<T>(topic: string, data: T): void {
        if (!this.subscriptions[topic] || this.subscriptions[topic].length === 0) {
            logger.warn(`No subscribers for topic: ${topic}`);
        }
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

    public async publishWithRetry<T>(topic: string, data: T, retries = 3): Promise<void> {
        const message: Message<T> = { topic, data, timestamp: Date.now() };
        while (retries > 0) {
            try {
                this.publish(topic, data);
                return;
            } catch (error) {
                retries--;
                logger.error(`Publish failed, retrying... ${error}`);
                await new Promise(res => setTimeout(res, 1000)); // wait before retrying
                if (retries === 0) throw error;
            }
        }
    }
}

const eventBus = new EventBus();
export default eventBus;