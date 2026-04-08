class InMemoryStore<T> {
    private data: Map<string, T> = new Map();
    private index: Map<string, Set<string>> = new Map();

    async create(id: string, item: T): Promise<void> {
        if (this.data.has(id)) throw new Error('Item already exists');
        this.data.set(id, item);
        this.indexItem(id, item);
    }

    async read(id: string): Promise<T | undefined> {
        return this.data.get(id);
    }

    async update(id: string, item: T): Promise<void> {
        if (!this.data.has(id)) throw new Error('Item not found');
        this.data.set(id, item);
        this.indexItem(id, item);
    }

    async delete(id: string): Promise<void> {
        if (!this.data.delete(id)) throw new Error('Item not found');
        this.index.delete(id);
    }

    private indexItem(id: string, item: T) {
        // Assume item has a key property for indexing
        const key = (item as any).key;
        if (!this.index.has(key)) this.index.set(key, new Set());
        this.index.get(key)!.add(id);
    }

    async findByIndex(key: string, value: any): Promise<T[]> {
        const ids = this.index.get(key);
        if (!ids) return [];
        return Array.from(ids).map(id => this.data.get(id) as T);
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
        this.index.clear();
    }
}

export default InMemoryStore;