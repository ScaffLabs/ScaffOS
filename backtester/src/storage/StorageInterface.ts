export interface StorageInterface<T> {
    create(data: T): Promise<any>;
    read(id: string): Promise<any>;
    update(id: string, data: T): Promise<any>;
    delete(id: string): Promise<boolean>;
    findAll(): Promise<any[]>;
    transaction(operations: Array<() => Promise<void>>): Promise<void>;
    migrate(data: T[]): Promise<void>;
    findByIndex(indexKey: string): Promise<any[]>;
}