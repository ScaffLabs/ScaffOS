import { Pool } from 'pg';
import { Order, OrderId } from './types';

class PostgresStorage {
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

export const postgresStorage = new PostgresStorage();
