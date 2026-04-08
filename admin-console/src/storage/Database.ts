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

    async findByValue(value: string): Promise<ConfigurationItem[]> {
        return this.store.findByIndex('value', value);
    }

    async transaction(operations: Array<() => Promise<void>>): Promise<void> {
        await this.store.transaction(operations);
    }
}

export default Database;