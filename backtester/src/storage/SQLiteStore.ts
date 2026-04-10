import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';
import { StorageInterface } from './StorageInterface';

export class SQLiteStore<T> implements StorageInterface<T> {
    private dbPromise: Promise<sqlite3.Database>;

    constructor(dbFile: string) {
        this.dbPromise = open({
            filename: dbFile,
            driver: sqlite3.Database
        });
    }

    async init(): Promise<void> {
        const db = await this.dbPromise;
        await db.run(`CREATE TABLE IF NOT EXISTS records (id TEXT PRIMARY KEY, data TEXT)`);
    }

    private async run(query: string, params: any[] = []): Promise<void> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            db.run(query, params, function(err) {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    private async get(query: string, params: any[] = []): Promise<T | undefined> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            db.get(query, params, (err, row) => {
                if (err) reject(err);
                else resolve(row ? JSON.parse(row.data) : undefined);
            });
        });
    }

    async create(data: T): Promise<any> {
        const id = uuidv4();
        await this.run(`INSERT INTO records (id, data) VALUES (?, ?)`, [id, JSON.stringify(data)]);
        return { id, data };
    }

    async read(id: string): Promise<any> {
        return await this.get(`SELECT * FROM records WHERE id = ?`, [id]);
    }

    async update(id: string, data: T): Promise<any> {
        await this.run(`UPDATE records SET data = ? WHERE id = ?`, [JSON.stringify(data), id]);
        return this.read(id);
    }

    async delete(id: string): Promise<boolean> {
        await this.run(`DELETE FROM records WHERE id = ?`, [id]);
        return true;
    }

    async findAll(): Promise<any[]> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM records`, (err, rows) => {
                if (err) reject(err);
                else resolve(rows.map(row => ({ id: row.id, data: JSON.parse(row.data) }))); 
            });
        });
    }

    async transaction(operations: Array<() => Promise<void>>): Promise<void> {
        const db = await this.dbPromise;
        await this.run(`BEGIN TRANSACTION`);
        for (const operation of operations) {
            await operation();
        }
        await this.run(`COMMIT`);
    }

    async migrate(data: T[]): Promise<void> {
        await Promise.all(data.map(item => this.create(item)));
    }
}