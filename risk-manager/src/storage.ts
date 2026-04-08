import { RiskPosition } from './sharedTypes';

export interface Storage<T> {
    create(item: T): Promise<T>;
    read(id: string): Promise<T | null>;
    update(id: string, item: T): Promise<T | null>;
    delete(id: string): Promise<boolean>;
    findAll(limit?: number, offset?: number): Promise<T[]>;
    transaction(operations: Array<() => Promise<any>>): Promise<void>;
    reset(): Promise<void>;
}

export class InMemoryStorage<T> implements Storage<T> {
    private items: Map<string, T> = new Map();

    async create(item: T): Promise<T> {
        const id = this.generateId();
        (item as any).id = id;
        this.items.set(id, item);
        return item;
    }

    async read(id: string): Promise<T | null> {
        return this.items.get(id) || null;
    }

    async update(id: string, item: T): Promise<T | null> {
        if (!this.items.has(id)) return null;
        this.items.set(id, { ...this.items.get(id), ...item });
        return this.items.get(id) as T;
    }

    async delete(id: string): Promise<boolean> {
        return this.items.delete(id);
    }

    async findAll(limit?: number, offset?: number): Promise<T[]> {
        const itemsArray = Array.from(this.items.values());
        return itemsArray.slice(offset || 0, (limit ? (offset || 0) + limit : itemsArray.length));
    }

    private generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }

    async transaction(operations: Array<() => Promise<any>>): Promise<void> {
        const results: any[] = [];
        const rollbackOperations: Array<() => Promise<any>> = [];
        try {
            for (const operation of operations) {
                results.push(await operation());
                rollbackOperations.push(() => this.delete(results[results.length - 1].id));
            }
        } catch (error) {
            await Promise.all(rollbackOperations.reverse().map(op => op()));
            throw new Error('Transaction failed: ' + error);
        }
    }

    async reset() {
        this.items.clear();
    }
}

export class RiskPositionStorage extends InMemoryStorage<RiskPosition> {
    private indexByAsset: Map<string, Set<RiskPosition>> = new Map();

    async create(item: RiskPosition): Promise<RiskPosition> {
        const createdItem = await super.create(item);
        this.indexByAsset.set(createdItem.asset, (this.indexByAsset.get(createdItem.asset) || new Set()).add(createdItem));
        return createdItem;
    }

    async delete(id: string): Promise<boolean> {
        const position = await this.read(id);
        if (position) {
            const assetSet = this.indexByAsset.get(position.asset);
            assetSet?.delete(position);
            if (assetSet?.size === 0) {
                this.indexByAsset.delete(position.asset);
            }
        }
        return super.delete(id);
    }

    async findByAsset(asset: string): Promise<RiskPosition[]> {
        return Array.from(this.indexByAsset.get(asset) || []);
    }
}