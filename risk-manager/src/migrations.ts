import { RiskPositionStorage } from './storage';
import { RiskPosition } from './sharedTypes';

export const migrateData = async (storage: RiskPositionStorage) => {
    console.log('Migrating data...');
    // Implement migration logic if necessary, e.g., data transformation
};

export const seedData = async (storage: RiskPositionStorage) => {
    const seedPositions: RiskPosition[] = [
        { id: '1', asset: 'AAPL', position: 100 },
        { id: '2', asset: 'GOOGL', position: 200 },
    ];
    for (const position of seedPositions) {
        await storage.create(position);
    }
};

export const runMigrations = async (storage: RiskPositionStorage) => {
    console.log('Running migrations...');
    await migrateData(storage);
};

export const resetData = async (storage: RiskPositionStorage) => {
    await storage.reset();
    await seedData(storage);
};
