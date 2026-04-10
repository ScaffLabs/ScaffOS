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

class MongoAlertStore implements AlertStoreInterface {
    async create(alert: Omit<AlertMessage, 'id'>): Promise<AlertMessage> {
        try {
            const newAlert = new AlertModel({ ...alert, id: new mongoose.Types.ObjectId().toString() });
            await newAlert.save();
            return newAlert;
        } catch (error) {
            throw new Error('Failed to create alert: ' + error.message);
        }
    }

    async read(id: OrderId): Promise<AlertMessage | null> {
        try {
            return await AlertModel.findById(id).exec();
        } catch (error) {
            throw new Error('Failed to read alert: ' + error.message);
        }
    }

    async update(id: OrderId, alert: Partial<Omit<AlertMessage, 'id'>>): Promise<AlertMessage | null> {
        try {
            return await AlertModel.findByIdAndUpdate(id, alert, { new: true }).exec();
        } catch (error) {
            throw new Error('Failed to update alert: ' + error.message);
        }
    }

    async delete(id: OrderId): Promise<boolean> {
        try {
            const result = await AlertModel.deleteOne({ id }).exec();
            return result.deletedCount > 0;
        } catch (error) {
            throw new Error('Failed to delete alert: ' + error.message);
        }
    }

    async findIndex(query: Partial<AlertMessage>): Promise<AlertMessage[]> {
        try {
            return await AlertModel.find(query).exec();
        } catch (error) {
            throw new Error('Failed to find alerts: ' + error.message);
        }
    }

    async deleteAll(): Promise<void> {
        try {
            await AlertModel.deleteMany({}).exec();
        } catch (error) {
            throw new Error('Failed to delete all alerts: ' + error.message);
        }
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
            throw new Error('Transaction failed: ' + error.message);
        } finally {
            session.endSession();
        }
    }
}

export const alertStore = new MongoAlertStore();