import mongoose, { Document, Schema } from 'mongoose';

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
        return await newAlert.save();
    }

    async read(id: string): Promise<AlertMessage | null> {
        return await AlertModel.findById(id).exec();
    }

    async update(id: string, alert: Partial<Omit<AlertMessage, '_id'>>): Promise<AlertMessage | null> {
        return await AlertModel.findByIdAndUpdate(id, alert, { new: true }).exec();
    }

    async delete(id: string): Promise<boolean> {
        const result = await AlertModel.findByIdAndDelete(id).exec();
        return result !== null;
    }

    async findIndex(query: Partial<AlertMessage>): Promise<AlertMessage[]> {
        return await AlertModel.find(query).exec();
    }
}