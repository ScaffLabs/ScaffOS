import { ConfigurationItem } from '../types';
import { Client } from 'pg';
import sqlite3 from 'sqlite3';
import InMemoryStore from './InMemoryStore';

class Database {
    private dbClient: Client | sqlite3.Database | InMemoryStore<ConfigurationItem> | null;

    constructor(dbType: string) {
        if (dbType === 'in-memory') {
            this.dbClient = new InMemoryStore<ConfigurationItem>();
        } else if (dbType === 'postgres') {
            this.dbClient = new Client();
        } else if (dbType === 'sqlite') {
            this.dbClient = new sqlite3.Database(':memory:');
        } else {
            throw new Error('Unsupported database type');
        }
    }

    async connect(databaseUrl: string) {
        if (this.dbClient instanceof Client) {
            await this.dbClient.connect();
        } else if (this.dbClient instanceof sqlite3.Database) {
            this.dbClient = new sqlite3.Database(databaseUrl.replace('sqlite://', ''));
        }
    }

    async createConfiguration(item: ConfigurationItem): Promise<void> {
        if (!this.dbClient) throw new Error('Database not connected');
        if (this.dbClient instanceof InMemoryStore) {
            await this.dbClient.create(item.key, item);
        } else {
            const query = 'INSERT INTO configurations(key, value) VALUES($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value';
            if (this.dbClient instanceof Client) {
                await this.dbClient.query(query, [item.key, item.value]);
            } else if (this.dbClient instanceof sqlite3.Database) {
                await new Promise((resolve, reject) => {
                    this.dbClient.run(query, [item.key, item.value], (err) => err ? reject(err) : resolve(null));
                });
            }
        }
    }

    async getConfigurationByKey(key: string): Promise<ConfigurationItem | null> {
        if (!this.dbClient) throw new Error('Database not connected');
        if (this.dbClient instanceof InMemoryStore) {
            return this.dbClient.read(key);
        }
        const query = 'SELECT * FROM configurations WHERE key = $1';
        if (this.dbClient instanceof Client) {
            const res = await this.dbClient.query(query, [key]);
            return res.rows[0] || null;
        } else if (this.dbClient instanceof sqlite3.Database) {
            return new Promise((resolve, reject) => {
                this.dbClient.get(query, [key], (err, row) => err ? reject(err) : resolve(row));
            });
        }
        return null;
    }

    async deleteConfiguration(key: string): Promise<void> {
        if (!this.dbClient) throw new Error('Database not connected');
        if (this.dbClient instanceof InMemoryStore) {
            await this.dbClient.delete(key);
        } else {
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

    async closeConnection() {
        if (this.dbClient instanceof Client) {
            await this.dbClient.end();
        } else if (this.dbClient instanceof sqlite3.Database) {
            this.dbClient.close();
        }
    }
}

export default Database;