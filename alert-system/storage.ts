import { AlertMessage, OrderId } from './alert.schema';
import mongoose, { Schema } from 'mongoose';

const alertSchema = new Schema<AlertMessage>({
    id: { type: String, required: true, unique: true },
    type: { type: String, enum: ['price', 'risk'], required: true },
    threshold: { type: Number, min: 0, required: true },
    currentValue: { type: Number, min: 0, required: true },
    createdAt: { type: Date, default: Date.now }
});

const AlertModel = mongoose.model<AlertMessage>('Alert', alertSchema);

export interface AlertStoreInterface {
    create(alert: Omit<AlertMessage, 'id'>): Promise<AlertMessage>;
    read(id: OrderId): Promise<AlertMessage | null>;
    update(id: OrderId, alert: Partial<Omit<AlertMessage, 'id'>>): Promise<AlertMessage | null>;
    delete(id: OrderId): Promise<boolean>;
    findIndex(query: Partial<AlertMessage>): Promise<AlertMessage[]>;
    deleteAll(): Promise<void>;
    transaction(operations: Array<() => Promise<void>>): Promise<void>;
}

class InMemoryAlertStore implements AlertStoreInterface {
    private store: { [key: string]: AlertMessage } = {};

    async create(alert: Omit<AlertMessage, 'id'>): Promise<AlertMessage> {
        const newAlert = { ...alert, id: new mongoose.Types.ObjectId().toString(), createdAt: new Date() };
        this.store[newAlert.id] = newAlert;
        return newAlert;
    }

    async read(id: OrderId): Promise<AlertMessage | null> {
        return this.store[id] || null;
    }

    async update(id: OrderId, alert: Partial<Omit<AlertMessage, 'id'>>): Promise<AlertMessage | null> {
        const existingAlert = this.store[id];
        if (!existingAlert) return null;
        const updatedAlert = { ...existingAlert, ...alert };
        this.store[id] = updatedAlert;
        return updatedAlert;
    }

    async delete(id: OrderId): Promise<boolean> {
        if (this.store[id]) {
            delete this.store[id];
            return true;
        }
        return false;
    }

    async findIndex(query: Partial<AlertMessage>): Promise<AlertMessage[]> {
        return Object.values(this.store).filter(alert => {
            return Object.keys(query).every(key => alert[key] === query[key]);
        });
    }

    async deleteAll(): Promise<void> {
        this.store = {};
    }

    async transaction(operations: Array<() => Promise<void>>): Promise<void> {
        const results: any[] = [];
        for (const operation of operations) {
            results.push(await operation());
        }
        return results;
    }
}

class MongoAlertStore implements AlertStoreInterface {
    async create(alert: Omit<AlertMessage, 'id'>): Promise<AlertMessage> {
        const newAlert = new AlertModel({ ...alert, id: new mongoose.Types.ObjectId().toString() });
        await newAlert.save();
        return newAlert;
    }

    async read(id: OrderId): Promise<AlertMessage | null> {
        return AlertModel.findById(id).exec();
    }

    async update(id: OrderId, alert: Partial<Omit<AlertMessage, 'id'>>): Promise<AlertMessage | null> {
        return AlertModel.findByIdAndUpdate(id, alert, { new: true }).exec();
    }

    async delete(id: OrderId): Promise<boolean> {
        const result = await AlertModel.deleteOne({ id }).exec();
        return result.deletedCount > 0;
    }

    async findIndex(query: Partial<AlertMessage>): Promise<AlertMessage[]> {
        return AlertModel.find(query).exec();
    }

    async deleteAll(): Promise<void> {
        await AlertModel.deleteMany({}).exec();
    }

    async transaction(operations: Array<() => Promise<void>>): Promise<void> {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            for (const operation of operations) {
                await operation();
            }
            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}

export const alertStore = process.env.NODE_ENV === 'production' ? new MongoAlertStore() : new InMemoryAlertStore();
