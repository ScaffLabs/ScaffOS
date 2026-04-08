import { EventEmitter } from 'events';

export class EventBus {
    private eventEmitter: EventEmitter;

    constructor() {
        this.eventEmitter = new EventEmitter();
    }

    publish(topic: string, message: any) {
        this.eventEmitter.emit(topic, message);
    }

    subscribe(topic: string, listener: (message: any) => void) {
        this.eventEmitter.on(topic, listener);
    }

    unsubscribe(topic: string, listener: (message: any) => void) {
        this.eventEmitter.off(topic, listener);
    }
} 