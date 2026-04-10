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
        if (!this.subscriptions[topic] || this.subscriptions[topic].length === 0) {
            logger.warn(`No subscribers for topic: ${topic}`);
            return;
        }
        const message: Message<T> = { topic, data, timestamp: Date.now() };
        this.emitter.emit(topic, message);
        logger.info(`Published message to topic: ${topic}`);
    }

    public clearSubscriptions(topic: string): void {
        if (this.subscriptions[topic]) {
            this.subscriptions[topic].forEach(listener => this.emitter.off(topic, listener));
            delete this.subscriptions[topic];
            logger.info(`Cleared subscriptions for topic: ${topic}`);
        }
    }
}

const eventBus = new EventBus();
export default eventBus;