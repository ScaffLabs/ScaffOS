import { Order } from './types';
import { storage } from './storage';

export const seedData = async () => {
  const initialOrders: Order[] = [
    { id: '1', type: 'limit', price: 100, quantity: 10, status: 'open' },
    { id: '2', type: 'market', price: 0, quantity: 5, status: 'open' }
  ];

  for (const order of initialOrders) {
    await storage.create(order);
  }
};

export const migrateData = async () => {
  console.log('Seeding initial data...');
  await seedData();
  console.log('Seeding complete!');
};
