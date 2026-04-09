import { ConfigurationItem } from '../types';
import Database from './Database';

const migrateData = async (sourceDb: Database, targetDb: Database): Promise<void> => {
    const configurations = await sourceDb.findAllConfigurations();
    for (const config of configurations) {
        await targetDb.createConfiguration(config);
    }
};

const runMigrations = async (sourceDb: Database, targetDb: Database): Promise<void> => {
    await migrateData(sourceDb, targetDb);
};

export { runMigrations };