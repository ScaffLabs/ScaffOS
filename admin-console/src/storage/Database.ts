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

    async closeConnection() {
        if (this.dbClient instanceof Client) {
            await this.dbClient.end();
        } else if (this.dbClient instanceof sqlite3.Database) {
            this.dbClient.close();
        }
    }
}

export default Database;