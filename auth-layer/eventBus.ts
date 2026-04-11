import { EventEmitter } from 'events';
import { UserCreatedEvent } from './types';

const eventBus = new EventEmitter();

export const emitUserCreatedEvent = (user): void => {
    const event: UserCreatedEvent = { type: 'UserCreated', payload: user };
    eventBus.emit('userCreated', event);
};

export const subscribeToUserCreatedEvent = (listener: (event: UserCreatedEvent) => void): void => {
    eventBus.on('userCreated', listener);
};

export const unsubscribeFromUserCreatedEvent = (listener: (event: UserCreatedEvent) => void): void => {
    eventBus.off('userCreated', listener);
};

export default eventBus;
