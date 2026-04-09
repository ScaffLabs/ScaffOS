import { AlertMessage, OrderId } from './alert.schema';
import mongoose from 'mongoose';

const connectionPool = mongoose.createConnection(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

export interface AlertStoreInterface {
    create(alert: Omit<AlertMessage, 'id'>): Promise<AlertMessage>;
    read(id: OrderId): Promise<AlertMessage | null>;
    update(id: OrderId, alert: Partial<Omit<AlertMessage, 'id'>>): Promise<AlertMessage | null>;
    delete(id: OrderId): Promise<boolean>;
    findIndex(query: Partial<AlertMessage>): Promise<AlertMessage[]>;
}

class MongoDBAlertStore implements AlertStoreInterface {
    async create(alert: Omit<AlertMessage, 'id'>): Promise<AlertMessage> {
        const newAlert = new AlertMessage({...alert, id: (Math.random() * 10000).toString() as OrderId, createdAt: new Date() });
        await connectionPool.model('Alert').create(newAlert);
        return newAlert;
    }

    async read(id: OrderId): Promise<AlertMessage | null> {
        return await connectionPool.model('Alert').findById(id);
    }

    async update(id: OrderId, alert: Partial<Omit<AlertMessage, 'id'>>): Promise<AlertMessage | null> {
        return await connectionPool.model('Alert').findByIdAndUpdate(id, alert, { new: true });
    }

    async delete(id: OrderId): Promise<boolean> {
        const result = await connectionPool.model('Alert').deleteOne({ id });
        return result.deletedCount > 0;
    }

    async findIndex(query: Partial<AlertMessage>): Promise<AlertMessage[]> {
        return await connectionPool.model('Alert').find(query);
    }
}

export const alertStore = new MongoDBAlertStore();