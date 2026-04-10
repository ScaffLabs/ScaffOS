import { InMemoryStore } from './inMemoryStore';
import { Strategy } from '../types';

export interface DatabaseStore<T> {
    create(record: T): Promise<any>;
    read(id: string): Promise<T | null>;
    update(id: string, record: T): Promise<T | null>;
    delete(id: string): Promise<boolean>;
    find(query: Partial<T>): Promise<T[]>;
    transaction(operations: Array<() => Promise<any>>): Promise<void>;
    runMigrations(): Promise<void>;
}

export class SQLiteStore<T> implements DatabaseStore<T> {
    // SQLite implementation details here
    // This includes methods like create, read, update, delete, find, etc.
}

export class PostgresStore<T> implements DatabaseStore<T> {
    // PostgreSQL implementation details here
}

export class DatabaseService<T> {
    private store: DatabaseStore<T>;

    constructor(store: DatabaseStore<T>) {
        this.store = store;
    }

    async create(record: T) {
        return this.store.create(record);
    }
    
    async read(id: string) {
        return this.store.read(id);
    }
    
    async update(id: string, record: T) {
        return this.store.update(id, record);
    }
    
    async delete(id: string) {
        return this.store.delete(id);
    }
    
    async find(query: Partial<T>) {
        return this.store.find(query);
    }

    async transaction(operations: Array<() => Promise<any>>) {
        return this.store.transaction(operations);
    }

    async runMigrations() {
        return this.store.runMigrations();
    }
}