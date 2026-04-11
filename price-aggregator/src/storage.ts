import { Pool } from 'pg';
import { PriceData } from './types';
import { logError } from './logger';
import inMemoryStorage from './inMemoryStorage';
import PostgresStorage from './postgresStorage';

interface Storage<T> {
    create(item: T): Promise<T>;
    read(id: string): Promise<T | null>;
    update(id: string, item: T): Promise<T | null>;
    delete(id: string): Promise<void>;
    findAll(query?: Partial<T>): Promise<T[]>;
    transaction(operations: () => Promise<void>): Promise<void>;
}

let storage: Storage<PriceData>;
if (process.env.USE_IN_MEMORY_STORAGE === 'true') {
    storage = inMemoryStorage;
} else {
    storage = new PostgresStorage<PriceData>();
}

export { storage };