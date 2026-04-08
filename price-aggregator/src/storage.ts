interface Storage<T> {
    create(item: T): Promise<T>;
    read(id: string): Promise<T | null>;
    update(id: string, item: T): Promise<T | null>;
    delete(id: string): Promise<void>;
    findAll(query?: Partial<T>): Promise<T[]>;
    transaction(operations: () => Promise<void>): Promise<void>;
}

class InMemoryStorage<T> implements Storage<T> {
    private items: Map<string, T> = new Map();
    private idCounter: number = 0;

    async create(item: T): Promise<T> {
        const id = (this.idCounter++).toString();
        this.items.set(id, { ...item, id } as T);
        return this.items.get(id) as T;
    }

    async read(id: string): Promise<T | null> {
        return this.items.get(id) || null;
    }

    async update(id: string, item: T): Promise<T | null> {
        if (!this.items.has(id)) return null;
        this.items.set(id, { ...item, id } as T);
        return this.items.get(id) as T;
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
        this.initialize();
    }

    private async initialize() {
        // Initialize SQLite connection and create necessary tables
    }

    async create(item: T): Promise<T> {
        // Implement create logic using SQLite
    }

    async read(id: string): Promise<T | null> {
        // Implement read logic using SQLite
    }

    async update(id: string, item: T): Promise<T | null> {
        // Implement update logic using SQLite
    }

    async delete(id: string): Promise<void> {
        // Implement delete logic using SQLite
    }

    async findAll(query?: Partial<T>): Promise<T[]> {
        // Implement findAll logic using SQLite
    }

    async transaction(operations: () => Promise<void>): Promise<void> {
        // Implement transaction logic using SQLite
    }
}

class PostgreSQLStorage<T> implements Storage<T> {
    private db: any; // Placeholder for PostgreSQL database connection

    constructor() {
        this.initialize();
    }

    private async initialize() {
        // Initialize PostgreSQL connection and create necessary tables
    }

    async create(item: T): Promise<T> {
        // Implement create logic using PostgreSQL
    }

    async read(id: string): Promise<T | null> {
        // Implement read logic using PostgreSQL
    }

    async update(id: string, item: T): Promise<T | null> {
        // Implement update logic using PostgreSQL
    }

    async delete(id: string): Promise<void> {
        // Implement delete logic using PostgreSQL
    }

    async findAll(query?: Partial<T>): Promise<T[]> {
        // Implement findAll logic using PostgreSQL
    }

    async transaction(operations: () => Promise<void>): Promise<void> {
        // Implement transaction logic using PostgreSQL
    }
}

export const storage = new InMemoryStorage<PriceData>();
// Export SQLiteStorage and PostgreSQLStorage for later use.