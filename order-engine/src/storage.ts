import { Order } from './types';
import { queryDatabase } from './db';

export interface Storage<T> {
    create(item: T): Promise<T>;
    read(id: string): Promise<T | null>;
    update(id: string, item: T): Promise<T | null>;
    delete(id: string): Promise<void>;
    findAll(): Promise<T[]>;
}

export class PostgresStorage<T extends { id: string }> implements Storage<T> {
    public async create(item: T): Promise<T> {
        const result = await queryDatabase('INSERT INTO orders (id, type, price, quantity, status) VALUES ($1, $2, $3, $4, $5) RETURNING *', [item.id, item.type, item.price, item.quantity, item.status]);
        return result.rows[0];
    }

    public async read(id: string): Promise<T | null> {
        const result = await queryDatabase('SELECT * FROM orders WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    public async update(id: string, item: T): Promise<T | null> {
        const result = await queryDatabase('UPDATE orders SET type = $1, price = $2, quantity = $3, status = $4 WHERE id = $5 RETURNING *', [item.type, item.price, item.quantity, item.status, id]);
        return result.rows[0] || null;
    }

    public async delete(id: string): Promise<void> {
        await queryDatabase('DELETE FROM orders WHERE id = $1', [id]);
    }

    public async findAll(): Promise<T[]> {
        const result = await queryDatabase('SELECT * FROM orders', []);
        return result.rows;
    }
}

export const storage = new PostgresStorage<Order>();