import { InMemoryStore } from './InMemoryStore';
import { Position } from '../types';

export const migrateData = (store: InMemoryStore<Position>, data: Position[]) => {
    data.forEach(item => {
        store.create(item);
    });
};

export const seedData = (): Position[] => {
    return [
        { id: '1', symbol: 'AAPL', quantity: 100 },
        { id: '2', symbol: 'GOOGL', quantity: 50 },
        { id: '3', symbol: 'MSFT', quantity: 75 }
    ];
};
