import { AlertMessage, OrderId } from './alert.schema';
import mongoose, { Schema } from 'mongoose';

const alertSchema = new Schema<AlertMessage>({
    id: { type: String, required: true },
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
}

class MongoAlertStore implements AlertStoreInterface {
    async create(alert: Omit<AlertMessage, 'id'>): Promise<AlertMessage> {
        const newAlert = new AlertModel(alert);
        await newAlert.save();
        return newAlert.toObject();
    }

    async read(id: OrderId): Promise<AlertMessage | null> {
        return AlertModel.findById(id).exec();
    }

    async update(id: OrderId, alert: Partial<Omit<AlertMessage, 'id'>>): Promise<AlertMessage | null> {
        return AlertModel.findByIdAndUpdate(id, alert, { new: true }).exec();
    }

    async delete(id: OrderId): Promise<boolean> {
        const result = await AlertModel.deleteOne({ id });
        return result.deletedCount > 0;
    }

    async findIndex(query: Partial<AlertMessage>): Promise<AlertMessage[]> {
        return AlertModel.find(query).exec();
    }
}

export const alertStore = new MongoAlertStore();