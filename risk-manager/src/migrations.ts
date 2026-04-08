import { RiskPosition } from './sharedTypes';
import { RiskPositionStorage } from './storage';

export const migrateData = async (storage: RiskPositionStorage) => {
    // Example migration logic - ensure the database is ready
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