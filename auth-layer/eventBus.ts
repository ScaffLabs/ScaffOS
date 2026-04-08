import { EventEmitter } from 'events';

const eventBus = new EventEmitter();

export const emitUserCreatedEvent = (user) => {
    eventBus.emit('userCreated', user);
};

export const subscribeToUserCreatedEvent = (listener) => {
    eventBus.on('userCreated', listener);
};

export default eventBus;