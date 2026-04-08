import { Portfolio, PortfolioUpdate } from '../types';

class InMemoryStorage {
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

    public getByIds(ids: string[]): Portfolio[] {
        return this.portfolios.filter(portfolio => ids.includes(portfolio.id));
    }

    public transaction(actions: (id: string, data?: PortfolioUpdate) => Portfolio | undefined, portfolioIds: string[]): Portfolio[] {
        const results: Portfolio[] = [];
        for (const id of portfolioIds) {
            const result = actions(id);
            if (result) results.push(result);
        }
        return results;
    }

    public indexBy(field: keyof Portfolio): { [key: string]: Portfolio[] } {
        return this.portfolios.reduce((acc, portfolio) => {
            const key = portfolio[field] as unknown as string;
            acc[key] = acc[key] || [];
            acc[key].push(portfolio);
            return acc;
        }, {} as { [key: string]: Portfolio[] });
    }
}

const storage = new InMemoryStorage();
export default storage;