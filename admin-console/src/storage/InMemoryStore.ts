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

    async transaction(operations: Array<() => Promise<void>>): Promise<void> {
        const results: Array<any> = [];
        const rollbackActions: Array<() => Promise<void>> = [];
        try {
            for (const operation of operations) {
                const result = await operation();
                results.push(result);
                rollbackActions.push(() => this.delete((result as any).key));
            }
        } catch (error) {
            await Promise.all(rollbackActions.reverse().map(fn => fn()));
            throw error;
        }
    }

    async clear() {
        this.data.clear();
    }

    async migrateData(targetDB: InMemoryStore<T>): Promise<void> {
        const items = await this.findAll();
        for (const item of items) {
            await targetDB.create((item as any).key, item);
        }
    }
}

export default InMemoryStore;