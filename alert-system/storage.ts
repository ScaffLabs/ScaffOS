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
    private nextId = 1;

    async create(alert: Omit<AlertMessage, 'id'>): Promise<AlertMessage> {
        const newAlert: AlertMessage = { ...alert, id: (this.nextId++).toString() as OrderId, createdAt: new Date() };
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
        return [...this.alerts.values()].filter(alert => {
            return Object.entries(query).every(([key, value]) => alert[key as keyof AlertMessage] === value);
        });
    }

    async transaction(operations: () => Promise<void>): Promise<void> {
        console.log('Transaction started');
        await operations();
        console.log('Transaction completed');
    }
}

export const alertStore = new InMemoryAlertStore();