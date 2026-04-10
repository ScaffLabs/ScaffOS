import { Pool } from 'pg';
import { PriceData } from './types';
import { logError } from './logger';

interface Storage<T> {
    create(item: T): Promise<T>;
    read(id: string): Promise<T | null>;
    update(id: string, item: T): Promise<T | null>;
    delete(id: string): Promise<void>;
    findAll(query?: Partial<T>): Promise<T[]>;
    transaction(operations: () => Promise<void>): Promise<void>;
}

class PostgresStorage<T> implements Storage<T> {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: Number(process.env.DB_PORT),
        });
    }

    async create(item: T): Promise<T> {
        const query = 'INSERT INTO prices(exchange, price, volume) VALUES($1, $2, $3) RETURNING *';
        const values = [item.exchange, item.price, item.volume];
        const result = await this.pool.query(query, values);
        return result.rows[0];
    }

    async read(id: string): Promise<T | null> {
        const query = 'SELECT * FROM prices WHERE id = $1';
        const result = await this.pool.query(query, [id]);
        return result.rows.length ? result.rows[0] : null;
    }

    async update(id: string, item: T): Promise<T | null> {
        const query = 'UPDATE prices SET exchange = $1, price = $2, volume = $3 WHERE id = $4 RETURNING *';
        const values = [item.exchange, item.price, item.volume, id];
        const result = await this.pool.query(query, values);
        return result.rows.length ? result.rows[0] : null;
    }

    async delete(id: string): Promise<void> {
        const query = 'DELETE FROM prices WHERE id = $1';
        await this.pool.query(query, [id]);
    }

    async findAll(query?: Partial<T>): Promise<T[]> {
        const conditions = [];
        const values = [];

        if (query) {
            if (query.exchange) {
                conditions.push('exchange = $' + (conditions.length + 1));
                values.push(query.exchange);
            }
            if (query.price) {
                conditions.push('price = $' + (conditions.length + 1));
                values.push(query.price);
            }
            if (query.volume) {
                conditions.push('volume = $' + (conditions.length + 1));
                values.push(query.volume);
            }
        }

        const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
        const queryText = 'SELECT * FROM prices ' + whereClause;
        const result = await this.pool.query(queryText, values);
        return result.rows;
    }

    async transaction(operations: () => Promise<void>): Promise<void> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            await operations();
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            logError(error, { message: 'Transaction failed' });
            throw error;
        } finally {
            client.release();
        }
    }
}

const storage = new PostgresStorage<PriceData>();
export { storage };