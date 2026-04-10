import { Portfolio, PortfolioUpdate } from '../types';

abstract class Storage {
    abstract create(portfolioData: Omit<Portfolio, 'id'>): Portfolio;
    abstract read(id: string): Portfolio | undefined;
    abstract update(id: string, data: PortfolioUpdate): Portfolio | undefined;
    abstract delete(id: string): boolean;
    abstract getAll(): Portfolio[];
    abstract clear(): void;
    abstract migrate(portfolios: Portfolio[]): void;
    abstract transaction(actions: (id: string, data?: PortfolioUpdate) => Portfolio | undefined, portfolioIds: string[]): Promise<Portfolio[]>;
    abstract indexBy(field: keyof Portfolio): Promise<{ [key: string]: Portfolio[] }>
}

class InMemoryStorage extends Storage {
    private portfolios: Portfolio[] = [];
    private idCounter: number = 1;

    public create(portfolioData: Omit<Portfolio, 'id'>): Portfolio {
        const newPortfolio: Portfolio = { id: String(this.idCounter++), ...portfolioData };
        this.portfolios.push(newPortfolio);
        return newPortfolio;
    }

    public read(id: string): Portfolio | undefined {
        return this.portfolios.find(portfolio => portfolio.id === id);
    }

    public update(id: string, data: PortfolioUpdate): Portfolio | undefined {
        const portfolio = this.read(id);
        if (!portfolio) return undefined;
        Object.assign(portfolio, data);
        return portfolio;
    }

    public delete(id: string): boolean {
        const index = this.portfolios.findIndex(portfolio => portfolio.id === id);
        if (index === -1) return false;
        this.portfolios.splice(index, 1);
        return true;
    }

    public getAll(): Portfolio[] {
        return this.portfolios;
    }

    public clear(): void {
        this.portfolios = [];
        this.idCounter = 1;
    }

    public migrate(portfolios: Portfolio[]): void {
        this.clear();
        portfolios.forEach(portfolio => this.create(portfolio));
    }

    public async transaction(actions: (id: string, data?: PortfolioUpdate) => Portfolio | undefined, portfolioIds: string[]): Promise<Portfolio[]> {
        const results: Portfolio[] = [];
        for (const id of portfolioIds) {
            const result = actions(id);
            if (result) results.push(result);
        }
        return results;
    }

    public async indexBy(field: keyof Portfolio): Promise<{ [key: string]: Portfolio[] }> {
        return this.portfolios.reduce((acc, portfolio) => {
            const key = portfolio[field].toString();
            if (!acc[key]) acc[key] = [];
            acc[key].push(portfolio);
            return acc;
        }, {} as { [key: string]: Portfolio[] });
    }
}

class SQLiteStorage extends Storage {
    private db: any;

    constructor() {
        this.db = require('sqlite');
        this.init();
    }

    private async init() {
        this.db = await this.db.open(':memory:');
        await this.db.exec(`CREATE TABLE portfolios (id TEXT PRIMARY KEY, name TEXT, positions TEXT)`);
    }

    public async create(portfolioData: Omit<Portfolio, 'id'>): Promise<Portfolio> {
        const id = String(this.idCounter++);
        await this.db.run(`INSERT INTO portfolios (id, name, positions) VALUES (?, ?, ?)`, [id, portfolioData.name, JSON.stringify(portfolioData.positions)]);
        return { id, ...portfolioData };
    }

    public async read(id: string): Promise<Portfolio | undefined> {
        const row = await this.db.get(`SELECT * FROM portfolios WHERE id = ?`, [id]);
        return row ? { id: row.id, name: row.name, positions: JSON.parse(row.positions) } : undefined;
    }

    public async update(id: string, data: PortfolioUpdate): Promise<Portfolio | undefined> {
        const portfolio = await this.read(id);
        if (!portfolio) return undefined;
        const updatedPortfolio = { ...portfolio, ...data };
        await this.db.run(`UPDATE portfolios SET name = ?, positions = ? WHERE id = ?`, [updatedPortfolio.name, JSON.stringify(updatedPortfolio.positions), id]);
        return updatedPortfolio;
    }

    public async delete(id: string): Promise<boolean> {
        const result = await this.db.run(`DELETE FROM portfolios WHERE id = ?`, [id]);
        return result.changes > 0;
    }

    public async getAll(): Promise<Portfolio[]> {
        const rows = await this.db.all(`SELECT * FROM portfolios`);
        return rows.map(row => ({ id: row.id, name: row.name, positions: JSON.parse(row.positions) }));
    }

    public async clear(): Promise<void> {
        await this.db.exec(`DELETE FROM portfolios`);
        this.idCounter = 1;
    }

    public async migrate(portfolios: Portfolio[]): Promise<void> {
        await this.clear();
        await Promise.all(portfolios.map(portfolio => this.create(portfolio)));
    }

    public async transaction(actions: (id: string, data?: PortfolioUpdate) => Portfolio | undefined, portfolioIds: string[]): Promise<Portfolio[]> {
        const results: Portfolio[] = [];
        for (const id of portfolioIds) {
            const result = actions(id);
            if (result) results.push(result);
        }
        return results;
    }

    public async indexBy(field: keyof Portfolio): Promise<{ [key: string]: Portfolio[] }> {
        const portfolios = await this.getAll();
        return portfolios.reduce((acc, portfolio) => {
            const key = portfolio[field].toString();
            if (!acc[key]) acc[key] = [];
            acc[key].push(portfolio);
            return acc;
        }, {} as { [key: string]: Portfolio[] });
    }
}

const storage = process.env.DATABASE_TYPE === 'sqlite' ? new SQLiteStorage() : new InMemoryStorage();
export default storage;