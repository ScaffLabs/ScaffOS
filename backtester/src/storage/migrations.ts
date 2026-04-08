import { SQLiteStore } from './SQLiteStore';
import { HistoricalData } from '../types';

const seedData: HistoricalData[] = [
    { timestamp: 1620000000, price: 100 },
    { timestamp: 1620000060, price: 101 },
];

export async function migrateDatabase(store: SQLiteStore<HistoricalData>): Promise<void> {
    await store.init();
    await store.migrate(seedData);
}
