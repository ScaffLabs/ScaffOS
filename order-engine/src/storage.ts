import { EventEmitter } from 'events';
import { Order, OrderId } from './types';
import { Pool } from 'pg';

interface Database<T> {
    create(item: T): Promise<T>;
    read(id: OrderId): Promise<T | null>;
    update(id: OrderId, updates: Partial<T>): Promise<T | null>;
    delete(id: OrderId): Promise<void>;
    findAll(): Promise<T[]>;
    findBy(criteria: Partial<T>): Promise<T[]>;
}

class InMemoryStorage<T extends { id: string }> implements Database<T> {
    private items: T[] = [];
    private eventEmitter: EventEmitter;

    constructor() {
        this.eventEmitter = new EventEmitter();
    }

    public create(item: T): Promise<T> {
        this.items.push(item);
        this.eventEmitter.emit('ORDER_CREATED', item);
        return Promise.resolve(item);
    }

    public read(id: OrderId): Promise<T | null> {
        const item = this.items.find(i => i.id === id);
        return Promise.resolve(item || null);
    }

    public update(id: OrderId, updates: Partial<T>): Promise<T | null> {
        const index = this.items.findIndex(i => i.id === id);
        if (index === -1) return Promise.resolve(null);

        const updatedItem = { ...this.items[index], ...updates }; 
        this.items[index] = updatedItem; 
        this.eventEmitter.emit('ORDER_UPDATED', updatedItem); 
        return Promise.resolve(updatedItem);
    }

    public delete(id: OrderId): Promise<void> {
        const index = this.items.findIndex(i => i.id === id);
        if (index === -1) return Promise.reject(new Error('Order not found.'));
        this.items.splice(index, 1);
        this.eventEmitter.emit('ORDER_DELETED', id);
        return Promise.resolve();
    }

    public findAll(): Promise<T[]> {
        return Promise.resolve(this.items);
    }

    public findBy(criteria: Partial<T>): Promise<T[]> {
        const result = this.items.filter(item => {
            return Object.keys(criteria).every(key => item[key] === criteria[key]);
        });
        return Promise.resolve(result);
    }

    public on(event: string, listener: (item: T) => void): void {
        this.eventEmitter.on(event, listener);
    }

    public off(event: string, listener: (item: T) => void): void {
        this.eventEmitter.off(event, listener);
    }
}

class PostgresStorage implements Database<Order> {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL
        });
    }

    public async create(item: Order): Promise<Order> {
        const result = await this.pool.query('INSERT INTO orders (id, type, price, quantity, status) VALUES ($1, $2, $3, $4, $5) RETURNING *', [item.id, item.type, item.price, item.quantity, item.status]);
        return result.rows[0];
    }

    public async read(id: OrderId): Promise<Order | null> {
        const result = await this.pool.query('SELECT * FROM orders WHERE id = $1', [id]);
        return result.rows.length ? result.rows[0] : null;
    }

    public async update(id: OrderId, updates: Partial<Order>): Promise<Order | null> {
        const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
        const values = [id, ...Object.values(updates)];
        const result = await this.pool.query(`UPDATE orders SET ${setClause} WHERE id = $1 RETURNING *`, values);
        return result.rows.length ? result.rows[0] : null;
    }

    public async delete(id: OrderId): Promise<void> {
        await this.pool.query('DELETE FROM orders WHERE id = $1', [id]);
    }

    public async findAll(): Promise<Order[]> {
        const result = await this.pool.query('SELECT * FROM orders');
        return result.rows;
    }

    public async findBy(criteria: Partial<Order>): Promise<Order[]> {
        const query = 'SELECT * FROM orders WHERE ' + 
            Object.keys(criteria).map((key, index) => `${key} = $${index + 1}`).join(' AND ');
        const values = Object.values(criteria);
        const result = await this.pool.query(query, values);
        return result.rows;
    }
}

const storage = process.env.DATABASE_URL ? new PostgresStorage() : new InMemoryStorage<Order>();

export { storage };