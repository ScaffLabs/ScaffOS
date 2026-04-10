class InMemoryStore<T> {
    private data: Map<string, T> = new Map();

    async create(id: string, item: T): Promise<void> {
        if (this.data.has(id)) throw new Error('Item already exists');
        this.data.set(id, item);
    }

    async read(id: string): Promise<T | undefined> {
        return this.data.get(id);
    }

    async update(id: string, item: T): Promise<void> {
        if (!this.data.has(id)) throw new Error('Item not found');
        this.data.set(id, item);
    }

    async delete(id: string): Promise<void> {
        if (!this.data.delete(id)) throw new Error('Item not found');
    }

    async findAll(): Promise<T[]> {
        return Array.from(this.data.values());
    }

    async clear() {
        this.data.clear();
    }

    async transaction(operations: () => Promise<void>): Promise<void> {
        const previousState = new Map(this.data);
        try {
            await operations();
        } catch (error) {
            this.data = previousState; // Rollback on error
            throw error;
        }
    }
}

export default InMemoryStore;