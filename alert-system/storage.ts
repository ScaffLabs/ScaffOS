import { AlertMessage, OrderId } from './alert.schema';
import mongoose, { Schema, Document } from 'mongoose';

export interface AlertStoreInterface {
    create(alert: Omit<AlertMessage, 'id'>): Promise<AlertMessage>;
    read(id: OrderId): Promise<AlertMessage | null>;
    update(id: OrderId, alert: Partial<Omit<AlertMessage, 'id'>>): Promise<AlertMessage | null>;
    delete(id: OrderId): Promise<boolean>;
    findIndex(query: Partial<AlertMessage>): Promise<AlertMessage[]>;
}

interface AlertDocument extends Document, AlertMessage {}

const alertSchema = new Schema<AlertDocument>({
    id: { type: String, required: true, unique: true },
    type: { type: String, enum: ['price', 'risk'], required: true },
    threshold: { type: Number, required: true },
    currentValue: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

const AlertModel = mongoose.model<AlertDocument>('Alert', alertSchema);

class MongoAlertStore implements AlertStoreInterface {
    async create(alert: Omit<AlertMessage, 'id'>): Promise<AlertMessage> {
        const newAlert = new AlertModel({ ...alert, id: new mongoose.Types.ObjectId().toString() });
        await newAlert.save();
        return newAlert.toObject();
    }

    async read(id: OrderId): Promise<AlertMessage | null> {
        const alert = await AlertModel.findById(id);
        return alert ? alert.toObject() : null;
    }

    async update(id: OrderId, alert: Partial<Omit<AlertMessage, 'id'>>): Promise<AlertMessage | null> {
        const updatedAlert = await AlertModel.findByIdAndUpdate(id, alert, { new: true });
        return updatedAlert ? updatedAlert.toObject() : null;
    }

    async delete(id: OrderId): Promise<boolean> {
        const result = await AlertModel.deleteOne({ id });
        return result.deletedCount > 0;
    }

    async findIndex(query: Partial<AlertMessage>): Promise<AlertMessage[]> {
        const alerts = await AlertModel.find(query);
        return alerts.map(alert => alert.toObject());
    }
}

export const alertStore = new MongoAlertStore();