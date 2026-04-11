import { InMemoryStore } from './InMemoryStore';
import { Position } from '../types';

const migrationData: Position[] = [
    { id: '4', symbol: 'TSLA', quantity: 30 },
    { id: '5', symbol: 'AMZN', quantity: 20 }
];

export const migrateData = (store: InMemoryStore<Position>, data: Position[]) => {
    data.forEach(position => {
        store.create(position);
    });
};

export const seedData = (): Position[] => {
    return [
        { id: '1', symbol: 'AAPL', quantity: 100 },
        { id: '2', symbol: 'GOOGL', quantity: 50 },
        { id: '3', symbol: 'MSFT', quantity: 75 }
    ];
};

export const initializeStore = (store: InMemoryStore<Position>) => {
    const seedPositions = seedData();
    migrateData(store, seedPositions);
};

export const migrateStore = (store: InMemoryStore<Position>) => {
    migrateData(store, migrationData);
};