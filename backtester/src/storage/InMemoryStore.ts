import { v4 as uuidv4 } from 'uuid';
import { StorageInterface } from './StorageInterface';

interface Entity<T> {
  id: string;
  data: T;
}

export class InMemoryStore<T> implements StorageInterface<T> {
  private store: Map<string, Entity<T>> = new Map();

  async create(data: T): Promise<Entity<T>> {
    const id = uuidv4();
    const entity = { id, data };
    this.store.set(id, entity);
    return entity;
  }

  async read(id: string): Promise<Entity<T> | undefined> {
    return this.store.get(id);
  }

  async update(id: string, data: T): Promise<Entity<T> | undefined> {
    const entity = this.store.get(id);
    if (entity) {
      entity.data = data;
      return entity;
    }
    return undefined;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  async findAll(): Promise<Entity<T>[]> {
    return Array.from(this.store.values());
  }

  async findByField(field: keyof T, value: any): Promise<Entity<T>[]> {
    return Array.from(this.store.values()).filter(entity => entity.data[field] === value);
  }

  async transaction(operations: Array<() => Promise<void>>): Promise<void> {
    const results: any[] = [];
    for (const operation of operations) {
      results.push(await operation());
    }
    return results;
  }

  async migrate(newData: T[]): Promise<void> {
    await Promise.all(newData.map(data => this.create(data)));
  }
}

export default InMemoryStore;