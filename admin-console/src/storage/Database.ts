import { ConfigurationItem } from '../types';
import InMemoryStore from './InMemoryStore';

class Database {
    private store: InMemoryStore<ConfigurationItem>;

    constructor() {
        this.store = new InMemoryStore<ConfigurationItem>();
    }

    async createConfiguration(item: ConfigurationItem): Promise<void> {
        await this.store.create(item.key, item);
    }

    async readConfiguration(key: string): Promise<ConfigurationItem | undefined> {
        return this.store.read(key);
    }

    async updateConfiguration(item: ConfigurationItem): Promise<void> {
        await this.store.update(item.key, item);
    }

    async deleteConfiguration(key: string): Promise<void> {
        await this.store.delete(key);
    }

    async findAll({ limit, offset, sortBy, order }: { limit: number; offset: number; sortBy: string; order: 'asc' | 'desc';}): Promise<ConfigurationItem[]> {
        const allItems = Array.from(this.store.getAll()); // Assume this method exists
        const sortedItems = allItems.sort((a, b) => {
            const comparison = a[sortBy].localeCompare(b[sortBy]);
            return order === 'asc' ? comparison : -comparison;
        });
        return sortedItems.slice(offset, offset + limit);
    }
}

export default Database;