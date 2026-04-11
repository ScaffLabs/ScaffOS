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
}

class MongoAlertStore implements AlertStoreInterface {
    async create(alert: Omit<AlertMessage, 'id'>): Promise<AlertMessage> {
        const newAlert = new AlertModel({ ...alert, id: new mongoose.Types.ObjectId().toString() });
        return await newAlert.save();
    }

    async read(id: OrderId): Promise<AlertMessage | null> {
        return await AlertModel.findOne({ id }).exec();
    }

    async update(id: OrderId, alert: Partial<Omit<AlertMessage, 'id'>>): Promise<AlertMessage | null> {
        const updatedAlert = await AlertModel.findOneAndUpdate({ id }, alert, { new: true }).exec();
        return updatedAlert;
    }

    async delete(id: OrderId): Promise<boolean> {
        const result = await AlertModel.deleteOne({ id }).exec();
        return result.deletedCount > 0;
    }

    async findIndex(query: Partial<AlertMessage>): Promise<AlertMessage[]> {
        return await AlertModel.find(query).exec();
    }

    async deleteAll(): Promise<void> {
        await AlertModel.deleteMany({}).exec();
    }
}

const connectToMongoDB = async () => {
    const mongoOptions = { useNewUrlParser: true, useUnifiedTopology: true };
    try {
        await mongoose.connect(process.env.MONGO_URI, mongoOptions);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        setTimeout(connectToMongoDB, 5000); // Retry connection
    }
};

connectToMongoDB();

export const alertStore = new MongoAlertStore();