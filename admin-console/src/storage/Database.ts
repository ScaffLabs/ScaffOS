import { ConfigurationItem } from '../types';
import InMemoryStore from './InMemoryStore';
import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
});

class Database {
    private dbClient: InMemoryStore<ConfigurationItem>;

    constructor() {
        this.dbClient = new InMemoryStore<ConfigurationItem>();
    }

    async connect() {
        logger.info('Database connected.');
    }

    async createConfiguration(item: ConfigurationItem): Promise<void> {
        logger.info(`Creating configuration: ${JSON.stringify(item)}`);
        return this.dbClient.create(item.key, item);
    }

    async readConfiguration(key: string): Promise<ConfigurationItem | undefined> {
        logger.info(`Reading configuration for key: ${key}`);
        return this.dbClient.read(key);
    }

    async updateConfiguration(item: ConfigurationItem): Promise<void> {
        logger.info(`Updating configuration: ${JSON.stringify(item)}`);
        return this.dbClient.update(item.key, item);
    }

    async deleteConfiguration(key: string): Promise<void> {
        logger.info(`Deleting configuration for key: ${key}`);
        return this.dbClient.delete(key);
    }

    async findAllConfigurations(): Promise<ConfigurationItem[]> {
        logger.info('Fetching all configurations.');
        return this.dbClient.findAll();
    }

    async transaction(operations: () => Promise<void>): Promise<void> {
        return this.dbClient.transaction(operations);
    }
}

export default Database;