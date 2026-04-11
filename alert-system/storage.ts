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
    private alerts: Map<OrderId, AlertMessage> = new Map();

    async create(alert: Omit<AlertMessage, 'id'>): Promise<AlertMessage> {
        const newAlert: AlertMessage = { id: `${Date.now()}`, ...alert, createdAt: new Date() };
        this.alerts.set(newAlert.id as OrderId, newAlert);
        return newAlert;
    }

    async read(id: OrderId): Promise<AlertMessage | null> {
        return this.alerts.get(id) || null;
    }

    async update(id: OrderId, alert: Partial<Omit<AlertMessage, 'id'>>): Promise<AlertMessage | null> {
        const existingAlert = this.alerts.get(id);
        if (!existingAlert) return null;
        const updatedAlert = { ...existingAlert, ...alert };
        this.alerts.set(id, updatedAlert);
        return updatedAlert;
    }

    async delete(id: OrderId): Promise<boolean> {
        return this.alerts.delete(id);
    }

    async findIndex(query: Partial<AlertMessage>): Promise<AlertMessage[]> {
        return Array.from(this.alerts.values()).filter(alert => {
            return Object.keys(query).every(key => alert[key] === query[key]);
        });
    }

    async deleteAll(): Promise<void> {
        this.alerts.clear();
    }

    async transaction(operations: Array<() => Promise<void>>): Promise<void> {
        const results: any[] = [];
        for (const operation of operations) {
            results.push(await operation());
        }
    }
}

export const alertStore = new InMemoryAlertStore();