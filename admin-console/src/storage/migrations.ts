import Database from './Database';
import { ConfigurationItem } from '../types';

const migrateData = async (sourceDb: Database, targetDb: Database) => {
    const configurations = await sourceDb.getConfigurations({ limit: 1000, offset: 0, sortBy: 'key', order: 'asc' });
    for (const config of configurations) {
        await targetDb.createConfiguration(config);
    }
};

const runMigrations = async (sourceDbUrl: string, targetDbUrl: string) => {
    const sourceDb = new Database();
    const targetDb = new Database();
    await sourceDb.connect(sourceDbUrl);
    await targetDb.connect(targetDbUrl);
    await migrateData(sourceDb, targetDb);
    await sourceDb.closeConnection();
    await targetDb.closeConnection();
};

export { runMigrations };  