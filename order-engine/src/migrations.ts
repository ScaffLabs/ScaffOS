import { Order } from './types';
import { storage } from './storage';

export const migrateOrders = async (data: Order[]): Promise<void> => {
    console.log('Migrating orders...');
    for (const order of data) {
        await storage.create(order);
    }
    console.log('Migration complete!');
};

export const seedData = async (): Promise<void> => {
    const initialOrders: Order[] = [
        { id: '1', type: 'limit', price: 100, quantity: 10, status: 'open' },
        { id: '2', type: 'market', price: 0, quantity: 5, status: 'open' },
        { id: '3', type: 'stop', price: 150, quantity: 3, status: 'open' }
    ];
    await migrateOrders(initialOrders);
};

export const runMigrations = async () => {
    await seedData();
};