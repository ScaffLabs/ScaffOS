import { EventEmitter } from 'events';

const eventBus = new EventEmitter();

export const connectToEventBus = () => {
  // Logic to connect to the event bus
  console.log('Connected to event bus');
};

export const publishPortfolioUpdate = (portfolio) => {
  eventBus.emit('portfolioUpdated', portfolio);
};

export const subscribeToPortfolioUpdates = (callback) => {
  eventBus.on('portfolioUpdated', callback);
};