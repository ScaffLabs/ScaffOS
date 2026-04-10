// In-memory data store implementation
import { AlertMessage, OrderId } from './alert.schema';

export interface AlertStoreInterface {
    create(alert: Omit<AlertMessage, 'id'>): Promise<AlertMessage>;
    read(id: OrderId): Promise<AlertMessage | null>;
    update(id: OrderId, alert: Partial<Omit<AlertMessage, 'id'>>): Promise<AlertMessage | null>;
    delete(id: OrderId): Promise<boolean>;
    findIndex(query: Partial<AlertMessage>): Promise<AlertMessage[]>;
    transaction(operations: () => Promise<void>): Promise<void>;
}

class InMemoryAlertStore implements AlertStoreInterface {
    private alerts: Map<OrderId, AlertMessage> = new Map();
    private idCounter = 1;

    async create(alert: Omit<AlertMessage, 'id'>): Promise<AlertMessage> {
        const newAlert: AlertMessage = { id: (this.idCounter++).toString() as OrderId, ...alert, createdAt: new Date() };
        this.alerts.set(newAlert.id, newAlert);
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
            return Object.keys(query).every(key => alert[key as keyof AlertMessage] === query[key as keyof Partial<AlertMessage>]);
        });
    }

    async transaction(operations: () => Promise<void>): Promise<void> {
        // Implement transaction logic if necessary
        await operations();
    }
}

export const alertStore = new InMemoryAlertStore();
