import { Order } from './types';

export interface Storage<T> {
  create(item: T): Promise<T>;
  read(id: string): Promise<T | null>;
  update(id: string, item: T): Promise<T | null>;
  delete(id: string): Promise<void>;
  findAll(): Promise<T[]>;
  transaction(operations: (storage: Storage<T>) => Promise<void>): Promise<void>;
  findByIndex(index: keyof T, value: any): Promise<T[]>;
}

export class InMemoryStorage<T extends { id: string }> implements Storage<T> {
  private items: T[] = [];
  private index: { [key: string]: Map<any, T[]> } = {};

  public async create(item: T): Promise<T> {
    this.items.push(item);
    this.indexItem(item);
    return item;
  }

  public async read(id: string): Promise<T | null> {
    return this.items.find(item => item.id === id) || null;
  }

  public async update(id: string, item: T): Promise<T | null> {
    const index = this.items.findIndex(i => i.id === id);
    if (index === -1) return null;
    this.items[index] = { ...this.items[index], ...item };
    this.indexItem(this.items[index]);
    return this.items[index];
  }

  public async delete(id: string): Promise<void> {
    this.items = this.items.filter(item => item.id !== id);
    this.removeIndex(id);
  }

  public async findAll(): Promise<T[]> {
    return this.items;
  }

  public async transaction(operations: (storage: Storage<T>) => Promise<void>): Promise<void> {
    const snapshot = [...this.items];
    try {
      await operations(this);
    } catch (error) {
      this.items = snapshot;
      throw error;
    }
  }

  public async findByIndex(index: keyof T, value: any): Promise<T[]> {
    return this.index[index]?.get(value) || [];
  }

  private indexItem(item: T) {
    for (const key in item) {
      if (!this.index[key]) {
        this.index[key] = new Map();
      }
      if (!this.index[key].has(item[key])) {
        this.index[key].set(item[key], []);
      }
      this.index[key].get(item[key])!.push(item);
    }
  }

  private removeIndex(id: string) {
    for (const key in this.index) {
      this.index[key].forEach((items, value) => {
        this.index[key].set(value, items.filter(item => item.id !== id));
      });
    }
  }
}

export const storage = new InMemoryStorage<Order>();