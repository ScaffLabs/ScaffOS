import { Position } from '../types';

interface Store<T> {
    create(item: T): T;
    read(id: string): T | undefined;
    update(id: string, item: Partial<T>): T | undefined;
    delete(id: string): boolean;
    findByIndex(index: string, value: any): T[];
    beginTransaction(): void;
    commit(): void;
    rollback(): void;
}

export class InMemoryStore<T extends { id: string }> implements Store<T> {
    private data: Record<string, T> = {};
    private transactions: Array<Record<string, T>> = [];
    private inTransaction: boolean = false;

    create(item: T): T {
        this.data[item.id] = item;
        return item;
    }

    read(id: string): T | undefined {
        return this.data[id];
    }

    update(id: string, item: Partial<T>): T | undefined {
        if (!this.data[id]) return undefined;
        this.data[id] = { ...this.data[id], ...item }; 
        return this.data[id];
    }

    delete(id: string): boolean {
        if (this.data[id]) {
            delete this.data[id];
            return true;
        }
        return false;
    }

    findByIndex(index: string, value: any): T[] {
        return Object.values(this.data).filter(item => item[index] === value);
    }

    beginTransaction(): void {
        this.inTransaction = true;
        this.transactions.push({ ...this.data });
    }

    commit(): void {
        this.inTransaction = false;
        this.transactions = [];
    }

    rollback(): void {
        if (this.inTransaction && this.transactions.length) {
            this.data = this.transactions.pop()!;
        }
        this.inTransaction = false;
    }

    seedData(): T[] {
        return [
            { id: '1', symbol: 'AAPL', quantity: 100 },
            { id: '2', symbol: 'GOOGL', quantity: 50 },
            { id: '3', symbol: 'MSFT', quantity: 75 }
        ];
    }

    migrateData(data: T[]): void {
        data.forEach(position => {
            this.create(position);
        });
    }
} 