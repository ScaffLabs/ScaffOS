import mongoose, { Document, Schema } from 'mongoose';
import logger from './logger';
import { AlertMessage, OrderId } from './alert.schema';

export interface AlertStoreInterface {
    create(alert: Omit<AlertMessage, 'id'>): Promise<AlertMessage>;
    read(id: OrderId): Promise<AlertMessage | null>;
    update(id: OrderId, alert: Partial<Omit<AlertMessage, 'id'>>): Promise<AlertMessage | null>;
    delete(id: OrderId): Promise<boolean>;
    findIndex(query: Partial<AlertMessage>): Promise<AlertMessage[]>;
}

const alertSchema = new Schema<AlertMessage>({
    id: { type: String, required: true, unique: true },
    type: { type: String, enum: ['price', 'risk'], required: true },
    threshold: { type: Number, required: true },
    currentValue: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

const AlertModel = mongoose.model<AlertMessage>('Alert', alertSchema);

export class MongoDBAlertStore implements AlertStoreInterface {
    async create(alert: Omit<AlertMessage, 'id'>): Promise<AlertMessage> {
        const newAlert = new AlertModel({ ...alert, id: (Math.random() * 10000).toString() });
        await newAlert.save();
        logger.info('Alert created:', newAlert);
        return newAlert.toObject();
    }

    async read(id: OrderId): Promise<AlertMessage | null> {
        const alert = await AlertModel.findOne({ id }).exec();
        logger.info('Alert read:', alert);
        return alert;
    }

    async update(id: OrderId, alert: Partial<Omit<AlertMessage, 'id'>>): Promise<AlertMessage | null> {
        const updatedAlert = await AlertModel.findOneAndUpdate({ id }, alert, { new: true }).exec();
        logger.info('Alert updated:', updatedAlert);
        return updatedAlert;
    }

    async delete(id: OrderId): Promise<boolean> {
        const result = await AlertModel.deleteOne({ id }).exec();
        logger.info('Alert deleted:', { id });
        return result.deletedCount > 0;
    }

    async findIndex(query: Partial<AlertMessage>): Promise<AlertMessage[]> {
        const alerts = await AlertModel.find(query).exec();
        logger.info('Alerts found:', alerts);
        return alerts;
    }
}