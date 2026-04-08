interface Storage<T> {
    create(item: T): Promise<T>;
    read(id: string): Promise<T | null>;
    update(id: string, item: T): Promise<T | null>;
    delete(id: string): Promise<void>;
    findAll(query?: Partial<T>): Promise<T[]>;
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
}

export const storage = new InMemoryStorage<PriceData>();