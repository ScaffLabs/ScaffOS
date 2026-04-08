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

export const clearAllData = async (): Promise<void> => {
    storage.clear();
};

export const fetchAllData = async (): Promise<Portfolio[]> => {
    return storage.getAll();
};

export const transaction = async (actions: (id: string, data?: PortfolioUpdate) => Portfolio | undefined, portfolioIds: string[]): Promise<Portfolio[]> => {
    return storage.transaction(actions, portfolioIds);
};

export const indexBy = async (field: keyof Portfolio): Promise<{ [key: string]: Portfolio[] }> => {
    return storage.indexBy(field);
};