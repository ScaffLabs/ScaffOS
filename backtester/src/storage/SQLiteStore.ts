import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { StorageInterface } from './StorageInterface';

export class SQLiteStore<T> implements StorageInterface<T> {
  private db: sqlite3.Database;

  constructor(dbFile: string) {
    this.db = new sqlite3.Database(dbFile);
  }

  async init(): Promise<void> {
    await this.run(`CREATE TABLE IF NOT EXISTS records (id TEXT PRIMARY KEY, data TEXT)`);
  }

  private run(query: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private get(query: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row ? JSON.parse(row.data) : undefined);
      });
    });
  }

  async create(data: T): Promise<any> {
    const id = uuidv4();
    await this.run(`INSERT INTO records (id, data) VALUES (?, ?)`, [id, JSON.stringify(data)]);
    return { id, data };
  }

  async read(id: string): Promise<any> {
    return await this.get(`SELECT * FROM records WHERE id = ?`, [id]);
  }

  async update(id: string, data: T): Promise<any> {
    await this.run(`UPDATE records SET data = ? WHERE id = ?`, [JSON.stringify(data), id]);
    return this.read(id);
  }

  async delete(id: string): Promise<boolean> {
    await this.run(`DELETE FROM records WHERE id = ?`, [id]);
    return true;
  }

  async findAll(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(`SELECT * FROM records`, (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => ({ id: row.id, data: JSON.parse(row.data) })));
      });
    });
  }

  async transaction(operations: Array<() => Promise<void>>): Promise<void> {
    await this.run(`BEGIN TRANSACTION`);
    for (const operation of operations) {
      await operation();
    }
    await this.run(`COMMIT`);
  }
}