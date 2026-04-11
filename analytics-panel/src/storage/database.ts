import { Strategy } from '../types';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';

export class SQLiteStore<T> implements Store<T> {
    private db: sqlite3.Database;

    constructor() {
        this.db = new sqlite3.Database(':memory:');
        this.initialize();
    }

    private async initialize() {
        await this.db.run('CREATE TABLE IF NOT EXISTS records (id TEXT PRIMARY KEY, data TEXT)');
    }

    async create(record: T): Promise<Record<T>> {
        const id = uuidv4();
        await this.db.run('INSERT INTO records (id, data) VALUES (?, ?)', id, JSON.stringify(record));
        return { id, data: record };
    }

    async read(id: string): Promise<Record<T> | null> {
        const row = await this.db.get('SELECT * FROM records WHERE id = ?', id);
        return row ? { id: row.id, data: JSON.parse(row.data) } : null;
    }

    async update(id: string, record: T): Promise<Record<T> | null> {
        await this.db.run('UPDATE records SET data = ? WHERE id = ?', JSON.stringify(record), id);
        return this.read(id);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.db.run('DELETE FROM records WHERE id = ?', id);
        return result.changes > 0;
    }

    async find(query: Partial<T>): Promise<Record<T>[]> {
        const allRecords = await this.db.all('SELECT * FROM records');
        return allRecords.filter(record => Object.keys(query).every(key => JSON.parse(record.data)[key] === query[key]));
    }

    async transaction(operations: Array<() => Promise<any>>): Promise<void> {
        await this.db.run('BEGIN TRANSACTION');
        try {
            for (const operation of operations) {
                await operation();
            }
            await this.db.run('COMMIT');
        } catch (error) {
            await this.db.run('ROLLBACK');
            throw error;
        }
    }

    async runMigrations() {
        console.log('Running migrations...');
        // Implement migration logic if needed
    }
}