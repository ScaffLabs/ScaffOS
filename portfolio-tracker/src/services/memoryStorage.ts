import { Portfolio, PortfolioUpdate } from '../types';

class MemoryStorage {
    private portfolios: Map<string, Portfolio> = new Map();

    async create(portfolioData: Omit<Portfolio, 'id'>): Promise<Portfolio> {
        const id = (Math.random() * 100000).toFixed(0);
        const portfolio = { id, ...portfolioData };
        this.portfolios.set(id, portfolio);
        return portfolio;
    }

    async read(id: string): Promise<Portfolio | null> {
        return this.portfolios.get(id) || null;
    }

    async update(id: string, data: PortfolioUpdate): Promise<Portfolio | null> {
        const existingPortfolio = this.portfolios.get(id);
        if (!existingPortfolio) return null;
        const updatedPortfolio = { ...existingPortfolio, ...data };
        this.portfolios.set(id, updatedPortfolio);
        return updatedPortfolio;
    }

    async delete(id: string): Promise<boolean> {
        return this.portfolios.delete(id);
    }

    async getAll(): Promise<Portfolio[]> {
        return Array.from(this.portfolios.values());
    }

    clear(): void {
        this.portfolios.clear();
    }

    async migrate(portfolios: Portfolio[]): Promise<void> {
        this.clear();
        portfolios.forEach(p => this.portfolios.set(p.id, p));
    }

    async transaction(actions: (id: string, data?: PortfolioUpdate) => Portfolio | undefined, portfolioIds: string[]): Promise<Portfolio[]> {
        const results: Portfolio[] = [];
        for (const id of portfolioIds) {
            const result = actions(id);
            if (result) results.push(result);
        }
        return results;
    }

    async indexBy(field: keyof Portfolio): Promise<{ [key: string]: Portfolio[] }> {
        return this.getAll().then(portfolios => {
            return portfolios.reduce((acc, portfolio) => {
                const key = portfolio[field].toString();
                if (!acc[key]) acc[key] = [];
                acc[key].push(portfolio);
                return acc;
            }, {} as { [key: string]: Portfolio[] });
        });
    }
}

const memoryStorage = new MemoryStorage();
export default memoryStorage;