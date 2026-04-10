import { ConfigurationItem } from '../types';
import Database from './Database';

const seedConfigurations: ConfigurationItem[] = [
    { key: 'config1', value: 'value1' },
    { key: 'config2', value: 'value2' },
    { key: 'config3', value: 'value3' },
];

const seedDatabase = async (db: Database): Promise<void> => {
    for (const config of seedConfigurations) {
        try {
            await db.createConfiguration(config);
        } catch (error) {
            console.error(`Failed to seed configuration ${config.key}: ${error.message}`);
        }
    }
};

export { seedDatabase };