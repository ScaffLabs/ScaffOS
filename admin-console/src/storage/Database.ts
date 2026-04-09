import { ConfigurationItem } from '../types';
import InMemoryStore from './InMemoryStore';

class Database {
    private dbClient: InMemoryStore<ConfigurationItem>;

    constructor() {
        this.dbClient = new InMemoryStore<ConfigurationItem>();
    }

    async connect() {
        // No connection needed for in-memory store
    }

    async createConfiguration(item: ConfigurationItem): Promise<void> {
        return this.dbClient.create(item.key, item);
    }

    async readConfiguration(key: string): Promise<ConfigurationItem | undefined> {
        return this.dbClient.read(key);
    }

    async updateConfiguration(item: ConfigurationItem): Promise<void> {
        return this.dbClient.update(item.key, item);
    }

    async deleteConfiguration(key: string): Promise<void> {
        return this.dbClient.delete(key);
    }

    async findAllConfigurations(): Promise<ConfigurationItem[]> {
        return this.dbClient.findAll();
    }

    async migrateData(targetDB: Database): Promise<void> {
        await this.dbClient.migrateData(targetDB.dbClient);
    }
}

export default Database;