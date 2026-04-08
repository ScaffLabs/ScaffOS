import { ConfigurationItem } from '../types';
import { Client } from 'pg';
import sqlite3 from 'sqlite3';

class Database {
    private dbClient: Client | sqlite3.Database | null;

    constructor() {
        this.dbClient = null;
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
        if (!this.dbClient) throw new Error('Database not connected');
        const query = 'INSERT INTO configurations(key, value) VALUES($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value';
        if (this.dbClient instanceof Client) {
            await this.dbClient.query(query, [item.key, item.value]);
        } else if (this.dbClient instanceof sqlite3.Database) {
            await new Promise((resolve, reject) => {
                this.dbClient.run(query, [item.key, item.value], (err) => err ? reject(err) : resolve(null));
            });
        }
    }

    async getConfigurations({ limit, offset, sortBy, order }: { limit: number; offset: number; sortBy: string; order: 'asc' | 'desc'; }): Promise<ConfigurationItem[]> {
        if (!this.dbClient) throw new Error('Database not connected');
        const query = `SELECT * FROM configurations ORDER BY ${sortBy} ${order} LIMIT $1 OFFSET $2`;
        if (this.dbClient instanceof Client) {
            const res = await this.dbClient.query(query, [limit, offset]);
            return res.rows;
        } else if (this.dbClient instanceof sqlite3.Database) {
            return new Promise((resolve, reject) => {
                this.dbClient.all(query, [limit, offset], (err, rows) => err ? reject(err) : resolve(rows));
            });
        }
        return [];
    }

    async getConfigurationByKey(key: string): Promise<ConfigurationItem | null> {
        if (!this.dbClient) throw new Error('Database not connected');
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

    async updateConfiguration(item: ConfigurationItem): Promise<void> {
        if (!this.dbClient) throw new Error('Database not connected');
        const query = 'UPDATE configurations SET value = $1 WHERE key = $2';
        if (this.dbClient instanceof Client) {
            await this.dbClient.query(query, [item.value, item.key]);
        } else if (this.dbClient instanceof sqlite3.Database) {
            await new Promise((resolve, reject) => {
                this.dbClient.run(query, [item.value, item.key], (err) => err ? reject(err) : resolve(null));
            });
        }
    }

    async deleteConfiguration(key: string): Promise<void> {
        if (!this.dbClient) throw new Error('Database not connected');
        const query = 'DELETE FROM configurations WHERE key = $1';
        if (this.dbClient instanceof Client) {
            await this.dbClient.query(query, [key]);
        } else if (this.dbClient instanceof sqlite3.Database) {
            await new Promise((resolve, reject) => {
                this.dbClient.run(query, [key], (err) => err ? reject(err) : resolve(null));
            });
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