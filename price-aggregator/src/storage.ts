interface Storage<T> {
    create(item: T): Promise<T>;
    read(id: string): Promise<T | null>;
    update(id: string, item: T): Promise<T | null>;
    delete(id: string): Promise<void>;
    findAll(query?: Partial<T>): Promise<T[]>;
    transaction(operations: () => Promise<void>): Promise<void>;
}

class InMemoryStorage<T> implements Storage<T> {
    private items: Map<string, T & { id: string }> = new Map();
    private idCounter: number = 0;

    async create(item: T): Promise<T & { id: string }> {
        const id = (this.idCounter++).toString();
        const newItem = { ...item, id };
        this.items.set(id, newItem as T & { id: string });
        return newItem;
    }

    async read(id: string): Promise<T | null> {
        return this.items.get(id) || null;
    }

    async update(id: string, item: T): Promise<T | null> {
        if (!this.items.has(id)) return null;
        const updatedItem = { ...item, id };
        this.items.set(id, updatedItem as T);
        return updatedItem;
    }

    async delete(id: string): Promise<void> {
        this.items.delete(id);
    }

    async findAll(query?: Partial<T>): Promise<T[]> {
        const results: T[] = [];
        for (const item of this.items.values()) {
            let match = true;
            for (const key in query) {
                if (item[key] !== query[key]) {
                    match = false;
                    break;
                }
            }
            if (match) results.push(item);
        }
        return results;
    }

    async transaction(operations: () => Promise<void>): Promise<void> {
        const snapshot = new Map(this.items);
        try {
            await operations();
        } catch (error) {
            this.items = snapshot;
            throw error;
        }
    }
}

class SQLiteStorage<T> implements Storage<T> {
    // SQLite implementation
}

class PostgreSQLStorage<T> implements Storage<T> {
    // PostgreSQL implementation
}

export const storage = new InMemoryStorage<PriceData>();
// Export SQLiteStorage and PostgreSQLStorage for later use.