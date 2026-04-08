import { EventEmitter } from 'events';

const eventBus = new EventEmitter();

export const connectToEventBus = () => {
    console.log('Connected to event bus');
};

export const publishPortfolioUpdate = (portfolio) => {
    eventBus.emit('portfolioUpdated', portfolio);
};

export const subscribeToPortfolioUpdates = (callback) => {
    eventBus.on('portfolioUpdated', callback);
};

export const unsubscribeFromPortfolioUpdates = (callback) => {
    eventBus.off('portfolioUpdated', callback);
};

export const getPortfolioUpdates = () => {
    return new Promise((resolve) => {
        eventBus.on('portfolioUpdated', (portfolio) => {
            resolve(portfolio);
        });
    });
};