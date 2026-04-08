import { Order } from './types';

export interface Storage<T> {
  create(item: T): Promise<T>;
  read(id: string): Promise<T | null>;
  update(id: string, item: T): Promise<T | null>;
  delete(id: string): Promise<void>;
  findAll(): Promise<T[]>;
  transaction(operations: (storage: Storage<T>) => Promise<void>): Promise<void>;
}

export class InMemoryStorage<T extends { id: string }> implements Storage<T> {
  // Existing properties and methods

  public async transaction(operations: (storage: Storage<T>) => Promise<void>): Promise<void> {
    const snapshot = [...this.items];
    try {
      await operations(this);
    } catch (error) {
      this.items = snapshot;
      throw error;
    }
  }
}

export const storage = new InMemoryStorage<Order>();