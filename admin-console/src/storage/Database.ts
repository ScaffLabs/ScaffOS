import { ConfigurationItem } from '../types';
import InMemoryStore from './InMemoryStore';

class Database {
    private dbClient: InMemoryStore<ConfigurationItem>;

    constructor(dbType: 'in-memory') {
        if (dbType === 'in-memory') {
            this.dbClient = new InMemoryStore<ConfigurationItem>();
        } else {
            throw new Error('Unsupported database type');
        }
    }

    async connect() {
        // No connection needed for in-memory store
    }

    async createConfiguration(item: ConfigurationItem): Promise<void> {
        await this.dbClient.create(item.key, item);
    }

    async getConfigurationByKey(key: string): Promise<ConfigurationItem | null> {
        return this.dbClient.read(key);
    }

    async deleteConfiguration(key: string): Promise<void> {
        await this.dbClient.delete(key);
    }

    async getAllConfigurations(): Promise<ConfigurationItem[]> {
        return this.dbClient.findAll();
    }

    async transaction(operations: Array<() => Promise<void>>): Promise<void> {
        await this.dbClient.transaction(operations);
    }

    async migrateData(targetDB: Database): Promise<void> {
        await this.dbClient.migrateData(targetDB.dbClient);
    }
}

export default Database;