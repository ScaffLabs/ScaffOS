export interface IStorage<T> {
    create(item: T): Promise<T>;
    read(id: string): Promise<T | null>;
    update(id: string, item: T): Promise<T | null>;
    delete(id: string): Promise<boolean>;
    findAll(limit?: number, offset?: number): Promise<T[]>;
    transaction(operations: (() => Promise<void>)[]): Promise<void>;
    migrate(): Promise<void>;
    seedData(data: T[]): Promise<void>;
    findByField(field: keyof T, value: any): Promise<T[]>;
}