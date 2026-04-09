import { ConfigurationItem } from '../types';
import InMemoryStore from './InMemoryStore';

const RETRY_LIMIT = 5;
const RETRY_DELAY = 1000; // milliseconds

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
        return this.retryAsync(() => this.dbClient.create(item.key, item));
    }

    async deleteConfiguration(key: string): Promise<void> {
        return this.retryAsync(() => this.dbClient.delete(key));
    }

    private async retryAsync(operation: () => Promise<void>, attempt: number = 0): Promise<void> {
        try {
            await operation();
        } catch (error) {
            if (attempt < RETRY_LIMIT) {
                console.error(`Retrying operation, attempt ${attempt + 1}`);
                await sleep(RETRY_DELAY * Math.pow(2, attempt));
                return this.retryAsync(operation, attempt + 1);
            }
            throw error;
        }
    }
}

export default Database;