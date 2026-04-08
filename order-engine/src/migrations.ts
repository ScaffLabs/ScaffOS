import { queryDatabase } from './db';
import { Order } from './types';
import { storage } from './storage';

export const createOrdersTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS orders (
            id VARCHAR PRIMARY KEY,
            type VARCHAR NOT NULL,
            price NUMERIC NOT NULL,
            quantity INTEGER NOT NULL,
            status VARCHAR NOT NULL
        );
    `;
    await queryDatabase(query, []);
};

export const seedData = async () => {
    const initialOrders: Order[] = [
        { id: '1' as OrderId, type: 'limit', price: 100, quantity: 10, status: 'open' },
        { id: '2' as OrderId, type: 'market', price: 0, quantity: 5, status: 'open' }
    ];

    for (const order of initialOrders) {
        await storage.create(order);
    }
};

export const migrateData = async () => {
    console.log('Creating orders table...');
    await createOrdersTable();
    console.log('Seeding initial data...');
    await seedData();
    console.log('Seeding complete!');
};

export const migrateOrders = async () => {
    console.log('Migrating orders...');
    // Logic for migrating orders from one storage to another can be implemented here
};
