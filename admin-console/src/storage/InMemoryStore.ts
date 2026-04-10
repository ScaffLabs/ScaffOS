class InMemoryStore<T> {
    private data: Map<string, T> = new Map();

    async create(id: string, item: T): Promise<void> {
        if (this.data.has(id)) throw new Error('Item already exists');
        this.data.set(id, item);
    }

    async read(id: string): Promise<T | undefined> {
        const item = this.data.get(id);
        if (!item) throw new Error('Item not found');
        return item;
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
}

export default InMemoryStore;