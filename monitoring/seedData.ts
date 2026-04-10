import InMemoryStore from './dataStore';
import { DashboardEntry } from './types';

export const seedDashboardData = (store: InMemoryStore<DashboardEntry>): void => {
    const sampleData: DashboardEntry[] = [
        { id: '1', data: { value: 100 } },
        { id: '2', data: { value: 200 } },
        { id: '3', data: { value: 300 } },
    ];

    sampleData.forEach(data => {
        store.create(data.data, data.id);
    });
};

export const clearStore = (store: InMemoryStore<DashboardEntry>): void => {
    store.clear();
};
