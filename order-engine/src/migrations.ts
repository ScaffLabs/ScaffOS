import { Order } from './types';
import { storage } from './storage';
import { queryDatabase } from './db';

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
        { id: '2', type: 'market', price: 0, quantity: 5, status: 'open' }
    ];
    await migrateOrders(initialOrders);
};

export const migrateDatabase = async () => {
    console.log('Starting database migration...');
    const orders = await queryDatabase('SELECT * FROM orders');
    await migrateOrders(orders.rows);
    console.log('Database migration complete!');
};

export const runMigrations = async () => {
    await seedData();
    await migrateDatabase();
};
