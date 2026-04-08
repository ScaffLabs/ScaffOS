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
    private db: any; // Placeholder for SQLite database connection

    constructor() {
        // Initialize SQLite database connection
    }

    async create(item: T): Promise<T> {
        // Implement SQLite create logic
        return item;
    }

    async read(id: string): Promise<T | null> {
        // Implement SQLite read logic
        return null;
    }

    async update(id: string, item: T): Promise<T | null> {
        // Implement SQLite update logic
        return null;
    }

    async delete(id: string): Promise<void> {
        // Implement SQLite delete logic
    }

    async findAll(query?: Partial<T>): Promise<T[]> {
        // Implement SQLite findAll logic
        return [];
    }

    async transaction(operations: () => Promise<void>): Promise<void> {
        // Implement SQLite transaction logic
        await operations();
    }
}

class PostgreSQLStorage<T> implements Storage<T> {
    // PostgreSQL implementation similar to SQLiteStorage
}

export const storage = new InMemoryStorage<PriceData>();
// To use SQLiteStorage or PostgreSQLStorage, export them as needed.