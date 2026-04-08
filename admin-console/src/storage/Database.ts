import { ConfigurationItem } from '../types';
import InMemoryStore from './InMemoryStore';
import { Client } from 'pg';
import sqlite3 from 'sqlite3';

class Database {
    private store: InMemoryStore<ConfigurationItem>;
    private dbClient: Client | sqlite3.Database | null;

    constructor() {
        this.store = new InMemoryStore<ConfigurationItem>();
        this.dbClient = null; // Initially no DB client
    }

    async connect(databaseUrl: string) {
        if (databaseUrl.startsWith('postgres://')) {
            this.dbClient = new Client({ connectionString: databaseUrl });
            await this.dbClient.connect();
        } else if (databaseUrl.startsWith('sqlite://')) {
            this.dbClient = new sqlite3.Database(databaseUrl.replace('sqlite://', ''));
        }
    }

    async createConfiguration(item: ConfigurationItem): Promise<void> {
        await this.store.create(item.key, item);
        // Persist to DB if connected
        if (this.dbClient) {
            const query = 'INSERT INTO configurations(key, value) VALUES($1, $2)';
            if (this.dbClient instanceof Client) {
                await this.dbClient.query(query, [item.key, item.value]);
            } else if (this.dbClient instanceof sqlite3.Database) {
                await new Promise((resolve, reject) => {
                    this.dbClient.run(query, [item.key, item.value], (err) => err ? reject(err) : resolve(null));
                });
            }
        }
    }

    async readConfiguration(key: string): Promise<ConfigurationItem | undefined> {
        return this.store.read(key);
    }

    async updateConfiguration(item: ConfigurationItem): Promise<void> {
        await this.store.update(item.key, item);
        // Update DB if connected
        if (this.dbClient) {
            const query = 'UPDATE configurations SET value = $1 WHERE key = $2';
            if (this.dbClient instanceof Client) {
                await this.dbClient.query(query, [item.value, item.key]);
            } else if (this.dbClient instanceof sqlite3.Database) {
                await new Promise((resolve, reject) => {
                    this.dbClient.run(query, [item.value, item.key], (err) => err ? reject(err) : resolve(null));
                });
            }
        }
    }

    async deleteConfiguration(key: string): Promise<void> {
        await this.store.delete(key);
        // Delete from DB if connected
        if (this.dbClient) {
            const query = 'DELETE FROM configurations WHERE key = $1';
            if (this.dbClient instanceof Client) {
                await this.dbClient.query(query, [key]);
            } else if (this.dbClient instanceof sqlite3.Database) {
                await new Promise((resolve, reject) => {
                    this.dbClient.run(query, [key], (err) => err ? reject(err) : resolve(null));
                });
            }
        }
    }

    async findAll({ limit, offset, sortBy, order }: { limit: number; offset: number; sortBy: string; order: 'asc' | 'desc';}): Promise<ConfigurationItem[]> {
        const allItems = Array.from(this.store.data.values());
        const sortedItems = allItems.sort((a, b) => {
            const comparison = a[sortBy].localeCompare(b[sortBy]);
            return order === 'asc' ? comparison : -comparison;
        });
        return sortedItems.slice(offset, offset + limit);
    }

    async closeConnection() {
        if (this.dbClient instanceof Client) {
            await this.dbClient.end();
        } else if (this.dbClient instanceof sqlite3.Database) {
            this.dbClient.close();
        }
    }
}

export default Database;