import { EventEmitter } from 'events';
import { Message } from './messageSchema';
import logger from './logger';

class EventBus {
    private emitter: EventEmitter;
    private subscriptions: Record<string, Array<(message: Message<any>) => void>>;
    private failureCount: Record<string, number> = {};
    private threshold: number = 5;
    private timeout: number = 5000;

    constructor() {
        this.emitter = new EventEmitter();
        this.subscriptions = {};
    }

    public subscribe<T>(topic: string, listener: (message: Message<T>) => void): void {
        if (!this.subscriptions[topic]) {
            this.subscriptions[topic] = [];
        }
        this.subscriptions[topic].push(listener);
        this.emitter.on(topic, listener);
        logger.info(`Subscribed to topic: ${topic}`);
    }

    public unsubscribe<T>(topic: string, listener: (message: Message<T>) => void): void {
        if (this.subscriptions[topic]) {
            this.subscriptions[topic] = this.subscriptions[topic].filter(l => l !== listener);
        }
        this.emitter.off(topic, listener);
        logger.info(`Unsubscribed from topic: ${topic}`);
    }

    public publish<T>(topic: string, data: T): void {
        if (this.isCircuitOpen(topic)) {
            logger.warn(`Circuit is open for topic: ${topic}`);
            return;
        }
        if (!this.subscriptions[topic] || this.subscriptions[topic].length === 0) {
            logger.warn(`No subscribers for topic: ${topic}`);
            return;
        }
        const message: Message<T> = { topic, data, timestamp: Date.now() };
        this.emitter.emit(topic, message);
        logger.info(`Published message to topic: ${topic}`);
    }

    private isCircuitOpen(topic: string): boolean {
        if (this.failureCount[topic] >= this.threshold) {
            const lastFailureTime = this.failureCount[topic + '_time'] || 0;
            if (Date.now() - lastFailureTime < this.timeout) {
                return true;
            }
            this.failureCount[topic] = 0; // Reset on timeout
        }
        return false;
    }

    public clearSubscriptions(topic: string): void {
        if (this.subscriptions[topic]) {
            this.subscriptions[topic].forEach(listener => this.emitter.off(topic, listener));
            delete this.subscriptions[topic];
            logger.info(`Cleared subscriptions for topic: ${topic}`);
        }
    }

    public reconnect(): void {
        logger.info('Reconnecting to all topics...');
        Object.keys(this.subscriptions).forEach(topic => {
            this.subscriptions[topic].forEach(listener => {
                this.emitter.on(topic, listener);
                logger.info(`Re-subscribed to topic: ${topic}`);
            });
        });
    }
}

const eventBus = new EventBus();
export default eventBus;