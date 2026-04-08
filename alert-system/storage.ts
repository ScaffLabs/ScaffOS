import { AlertMessage } from './alert.schema';

interface IDataStore<T> {
    create(item: T): Promise<T>;
    read(id: string): Promise<T | null>;
    update(id: string, item: Partial<T>): Promise<T | null>;
    delete(id: string): Promise<boolean>;
    findIndex(query: Partial<T>): Promise<T[]>;
    transaction(operations: (() => Promise<void>)[]): Promise<void>;
}

class InMemoryStore<T> implements IDataStore<T> {
    private data: Map<string, T> = new Map();
    private nextId = 1;

    async create(item: T): Promise<T> {
        const id = this.nextId++.toString();
        this.data.set(id, { ...item, id });
        return { ...item, id };  
    }

    async read(id: string): Promise<T | null> {
        return this.data.get(id) || null;
    }

    async update(id: string, item: Partial<T>): Promise<T | null> {
        if (!this.data.has(id)) return null;
        const existing = this.data.get(id)!;
        const updated = { ...existing, ...item };
        this.data.set(id, updated);
        return updated;
    }

    async delete(id: string): Promise<boolean> {
        return this.data.delete(id);
    }

    async findIndex(query: Partial<T>): Promise<T[]> {
        return Array.from(this.data.values()).filter(item => Object.keys(query).every(key => item[key] === query[key]));
    }

    async transaction(operations: (() => Promise<void>)[]): Promise<void> {
        const results = [];
        for (const operation of operations) {
            results.push(await operation());
        }
        return results;
    }
}

export class AlertStore extends InMemoryStore<AlertMessage> {
    // Adding indexing for common queries.
    private index: Map<string, Map<string, AlertMessage>> = new Map();

    async create(item: AlertMessage): Promise<AlertMessage> {
        const createdItem = await super.create(item);
        this.indexItem(createdItem);
        return createdItem;
    }

    async update(id: string, item: Partial<AlertMessage>): Promise<AlertMessage | null> {
        const updatedItem = await super.update(id, item);
        if (updatedItem) this.indexItem(updatedItem);
        return updatedItem;
    }

    private indexItem(item: AlertMessage) {
        if (!this.index.has(item.type)) {
            this.index.set(item.type, new Map());
        }
        this.index.get(item.type)!.set(item.id, item);
    }

    async findByType(type: string): Promise<AlertMessage[]> {
        return Array.from(this.index.get(type)?.values() || []);
    }
}

export class MigrationUtil {
    static async seedData(store: AlertStore) {
        const seedData: AlertMessage[] = [
            { id: '1', type: 'price', threshold: 100, currentValue: 90, createdAt: new Date() },
            { id: '2', type: 'risk', threshold: 50, currentValue: 30, createdAt: new Date() }
        ];
        for (const item of seedData) {
            await store.create(item);
        }
    }

    static async migrateToNewVersion(store: AlertStore, newSchema: any) {
        const allAlerts = await store.findIndex({});
        for (const alert of allAlerts) {
            await store.update(alert.id, { ...alert, migrated: true });
        }
    }
}