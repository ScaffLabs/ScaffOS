import mongoose, { Document, Schema } from 'mongoose';
import logger from './logger';

export interface AlertMessage extends Document {
    type: 'price' | 'risk';
    threshold: number;
    currentValue: number;
    createdAt: Date;
}

const alertSchema = new Schema<AlertMessage>({
    type: { type: String, required: true },
    threshold: { type: Number, required: true },
    currentValue: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

const AlertModel = mongoose.model<AlertMessage>('Alert', alertSchema);

export class AlertStore {
    async create(alert: Omit<AlertMessage, '_id'>): Promise<AlertMessage> {
        const newAlert = new AlertModel(alert);
        const start = Date.now();
        const result = await newAlert.save();
        const duration = Date.now() - start;
        logger.debug({ operation: 'create', duration }, 'Performance timing for create operation');
        return result;
    }

    async read(id: string): Promise<AlertMessage | null> {
        const start = Date.now();
        const result = await AlertModel.findById(id).exec();
        const duration = Date.now() - start;
        logger.debug({ operation: 'read', duration }, 'Performance timing for read operation');
        return result;
    }

    async update(id: string, alert: Partial<Omit<AlertMessage, '_id'>>): Promise<AlertMessage | null> {
        const start = Date.now();
        const result = await AlertModel.findByIdAndUpdate(id, alert, { new: true }).exec();
        const duration = Date.now() - start;
        logger.debug({ operation: 'update', duration }, 'Performance timing for update operation');
        return result;
    }

    async delete(id: string): Promise<boolean> {
        const start = Date.now();
        const result = await AlertModel.findByIdAndDelete(id).exec();
        const duration = Date.now() - start;
        logger.debug({ operation: 'delete', duration }, 'Performance timing for delete operation');
        return result !== null;
    }

    async findIndex(query: Partial<AlertMessage>): Promise<AlertMessage[]> {
        const start = Date.now();
        const result = await AlertModel.find(query).exec();
        const duration = Date.now() - start;
        logger.debug({ operation: 'findIndex', duration }, 'Performance timing for findIndex operation');
        return result;
    }
}