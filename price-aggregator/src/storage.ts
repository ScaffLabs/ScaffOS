interface Storage<T> {
    create(item: T): Promise<T>;
    read(id: string): Promise<T | null>;
    update(id: string, item: T): Promise<T | null>;
    delete(id: string): Promise<void>;
    findAll(query?: Partial<T>): Promise<T[]>;
    transaction(operations: () => Promise<void>): Promise<void>;
}

class InMemoryStorage<T> implements Storage<T> {
    private data: Map<string, T> = new Map();
    private idCounter: number = 0;

    async create(item: T): Promise<T> {
        const id = (++this.idCounter).toString();
        this.data.set(id, { ...item, id } as T);
        return this.data.get(id)!;
    }

    async read(id: string): Promise<T | null> {
        return this.data.get(id) || null;
    }

    async update(id: string, item: T): Promise<T | null> {
        if (!this.data.has(id)) return null;
        this.data.set(id, { ...item, id } as T);
        return this.data.get(id)!;
    }
    
    async delete(id: string): Promise<void> {
        this.data.delete(id);
    }

    async findAll(query?: Partial<T>): Promise<T[]> {
        const results: T[] = [];
        for (const item of this.data.values()) {
            if (query) {
                const match = Object.entries(query).every(([key, value]) => item[key] === value);
                if (match) results.push(item);
            } else {
                results.push(item);
            }
        }
        return results;
    }

    async transaction(operations: () => Promise<void>): Promise<void> {
        const backup = new Map(this.data);
        try {
            await operations();
        } catch (error) {
            this.data = backup; // Rollback on error
            throw error;
        }
    }
}

const storage = new InMemoryStorage<PriceData>();
export { storage };