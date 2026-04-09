import { AlertMessage, OrderId } from './alert.schema';

export interface AlertStoreInterface {
    create(alert: Omit<AlertMessage, 'id'>): Promise<AlertMessage>;
    read(id: OrderId): Promise<AlertMessage | null>;
    update(id: OrderId, alert: Partial<Omit<AlertMessage, 'id'>>): Promise<AlertMessage | null>;
    delete(id: OrderId): Promise<boolean>;
    findIndex(query: Partial<AlertMessage>): Promise<AlertMessage[]>;
}

class InMemoryAlertStore implements AlertStoreInterface {
    private alerts: AlertMessage[] = [];

    async create(alert: Omit<AlertMessage, 'id'>): Promise<AlertMessage> {
        const newAlert: AlertMessage = { ...alert, id: (Math.random() * 10000).toString() as OrderId, createdAt: new Date() };
        this.alerts.push(newAlert);
        return newAlert;
    }

    async read(id: OrderId): Promise<AlertMessage | null> {
        return this.alerts.find(alert => alert.id === id) || null;
    }

    async update(id: OrderId, alert: Partial<Omit<AlertMessage, 'id'>>): Promise<AlertMessage | null> {
        const existingAlert = await this.read(id);
        if (!existingAlert) return null;
        Object.assign(existingAlert, alert);
        return existingAlert;
    }

    async delete(id: OrderId): Promise<boolean> {
        const index = this.alerts.findIndex(alert => alert.id === id);
        if (index === -1) return false;
        this.alerts.splice(index, 1);
        return true;
    }

    async findIndex(query: Partial<AlertMessage>): Promise<AlertMessage[]> {
        return this.alerts.filter(alert => Object.keys(query).every(key => alert[key as keyof AlertMessage] === query[key as keyof AlertMessage]));
    }
}

export const alertStore = new InMemoryAlertStore();

export class MongoDBAlertStore implements AlertStoreInterface {
    // Existing MongoDB implementation...
} 