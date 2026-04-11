import { Portfolio, PortfolioUpdate } from '../types';
import { MongoClient } from 'mongodb';
import env from '../config';
import memoryStorage from './memoryStorage';

class Storage {
    private client: MongoClient;
    private dbName = env.DB_NAME;
    private db;

    constructor() {
        this.client = new MongoClient(env.DATABASE_URL);
        this.client.connect().then(() => {
            this.db = this.client.db(this.dbName);
        });
    }

    async create(portfolioData: Omit<Portfolio, 'id'>): Promise<Portfolio> {
        if (process.env.STORAGE_TYPE === 'memory') {
            return memoryStorage.create(portfolioData);
        }
        const result = await this.db.collection('portfolios').insertOne(portfolioData);
        return { id: result.insertedId.toString(), ...portfolioData };
    }

    async read(id: string): Promise<Portfolio | null> {
        if (process.env.STORAGE_TYPE === 'memory') {
            return memoryStorage.read(id);
        }
        return await this.db.collection('portfolios').findOne({ _id: new MongoClient.ObjectId(id) });
    }

    async update(id: string, data: PortfolioUpdate): Promise<Portfolio | null> {
        if (process.env.STORAGE_TYPE === 'memory') {
            return memoryStorage.update(id, data);
        }
        await this.db.collection('portfolios').updateOne({ _id: new MongoClient.ObjectId(id) }, { $set: data });
        return this.read(id);
    }

    async delete(id: string): Promise<boolean> {
        if (process.env.STORAGE_TYPE === 'memory') {
            return memoryStorage.delete(id);
        }
        const result = await this.db.collection('portfolios').deleteOne({ _id: new MongoClient.ObjectId(id) });
        return result.deletedCount === 1;
    }

    async getAll(): Promise<Portfolio[]> {
        if (process.env.STORAGE_TYPE === 'memory') {
            return memoryStorage.getAll();
        }
        return this.db.collection('portfolios').find().toArray();
    }

    clear(): void {
        if (process.env.STORAGE_TYPE === 'memory') {
            memoryStorage.clear();
        } else {
            this.db.collection('portfolios').deleteMany({});
        }
    }

    async migrate(portfolios: Portfolio[]): Promise<void> {
        if (process.env.STORAGE_TYPE === 'memory') {
            await memoryStorage.migrate(portfolios);
        } else {
            await this.clear();
            await this.db.collection('portfolios').insertMany(portfolios);
        }
    }

    async transaction(actions: (id: string, data?: PortfolioUpdate) => Portfolio | undefined, portfolioIds: string[]): Promise<Portfolio[]> {
        if (process.env.STORAGE_TYPE === 'memory') {
            return memoryStorage.transaction(actions, portfolioIds);
        }
        const results: Portfolio[] = [];
        for (const id of portfolioIds) {
            const result = actions(id);
            if (result) results.push(result);
        }
        return results;
    }

    async indexBy(field: keyof Portfolio): Promise<{ [key: string]: Portfolio[] }> {
        if (process.env.STORAGE_TYPE === 'memory') {
            return memoryStorage.indexBy(field);
        }
        const portfolios = await this.getAll();
        return portfolios.reduce((acc, portfolio) => {
            const key = portfolio[field].toString();
            if (!acc[key]) acc[key] = [];
            acc[key].push(portfolio);
            return acc;
        }, {} as { [key: string]: Portfolio[] });
    }
}

const storage = new Storage();
export default storage;