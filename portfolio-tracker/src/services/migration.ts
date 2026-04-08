import storage from './storage';
import { Portfolio } from '../types';

export const migrateData = async (data: Portfolio[]): Promise<void> => {
    storage.migrate(data);
};

export const seedData = async (): Promise<void> => {
    const seedPortfolios: Portfolio[] = [
        { id: '1', name: 'Seed Portfolio 1', positions: [{ symbol: 'AAPL', quantity: 10, averagePrice: 150 }] },
        { id: '2', name: 'Seed Portfolio 2', positions: [{ symbol: 'GOOGL', quantity: 5, averagePrice: 2000 }] }
    ];
    storage.migrate(seedPortfolios);
};
