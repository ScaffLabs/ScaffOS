import { IStorage } from './IStorage';
import { Event } from '../types';

export class InMemoryEventStorage implements IStorage<Event> {
    private storage: Record<string, Event & { id: string }> = {};
    private currentId = 0;

    async create(item: Event): Promise<Event & { id: string }> {
        const id = String(++this.currentId);
        this.storage[id] = { ...item, id };
        return this.storage[id];
    }

    async read(id: string): Promise<Event | null> {
        return this.storage[id] || null;
    }

    async update(id: string, item: Partial<Event>): Promise<Event | null> {
        if (!this.storage[id]) return null;
        this.storage[id] = { ...this.storage[id], ...item };
        return this.storage[id];
    }

    async delete(id: string): Promise<boolean> {
        if (!this.storage[id]) return false;
        delete this.storage[id];
        return true;
    }

    async findAll(limit: number = 10, offset: number = 0): Promise<Event[]> {
        return Object.values(this.storage).slice(offset, offset + limit);
    }

    async findByField(field: keyof Event, value: any): Promise<Event[]> {
        return Object.values(this.storage).filter(event => event[field] === value);
    }
}