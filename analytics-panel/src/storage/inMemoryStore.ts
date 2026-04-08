import { v4 as uuidv4 } from 'uuid';

interface Record<T> {
    id: string;
    data: T;
}

interface Store<T> {
    create(record: T): Promise<Record<T>>;
    read(id: string): Promise<Record<T> | null>;
    update(id: string, record: T): Promise<Record<T> | null>;
    delete(id: string): Promise<boolean>;
    find(query: Partial<T>): Promise<Record<T>[]>
    transaction(operations: Array<() => Promise<any>>): Promise<void>;
}

export class InMemoryStore<T> implements Store<T> {
    private records: Record<T>[] = [];

    async create(record: T): Promise<Record<T>> {
        const newRecord = { id: uuidv4(), data: record };
        this.records.push(newRecord);
        return newRecord;
    }

    async read(id: string): Promise<Record<T> | null> {
        return this.records.find(record => record.id === id) || null;
    }

    async update(id: string, record: T): Promise<Record<T> | null> {
        const index = this.records.findIndex(r => r.id === id);
        if (index === -1) return null;
        this.records[index].data = record;
        return this.records[index];
    }

    async delete(id: string): Promise<boolean> {
        const index = this.records.findIndex(r => r.id === id);
        if (index === -1) return false;
        this.records.splice(index, 1);
        return true;
    }

    async find(query: Partial<T>): Promise<Record<T>[]> {
        return this.records.filter(record => Object.keys(query).every(key => record.data[key] === query[key]));
    }

    async transaction(operations: Array<() => Promise<any>>): Promise<void> {
        const results = [];
        for (const operation of operations) {
            results.push(await operation());
        }
        return results;
    }
}