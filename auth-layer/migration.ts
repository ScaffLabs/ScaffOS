import fs from 'fs';
import path from 'path';
import { User } from './user';
import userStore from './storage';

const SEED_DATA_PATH = path.join(__dirname, 'seed.json');

const readSeedData = (): User[] => {
    const data = fs.readFileSync(SEED_DATA_PATH, 'utf8');
    return JSON.parse(data);
};

export const migrateData = async () => {
    const seedData = readSeedData();
    for (const user of seedData) {
        userStore.create(user);
    }
};

export const clearData = () => {
    userStore.findAll().forEach(user => userStore.delete(user.id));
};

export const seedData = async () => {
    clearData();
    await migrateData();
};

if (require.main === module) {
    seedData().then(() => console.log('Seeding completed')).catch(console.error);
}