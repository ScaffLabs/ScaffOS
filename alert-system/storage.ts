import { Document, Schema } from 'mongoose';
import logger from './logger';
import { AlertMessage, OrderId } from './alert.schema';

export interface AlertStoreInterface {
    create(alert: Omit<AlertMessage, 'id'>): Promise<AlertMessage>;
    read(id: OrderId): Promise<AlertMessage | null>;
    update(id: OrderId, alert: Partial<Omit<AlertMessage, 'id'>>): Promise<AlertMessage | null>;
    delete(id: OrderId): Promise<boolean>;
    findIndex(query: Partial<AlertMessage>): Promise<AlertMessage[]>;
}

export class InMemoryAlertStore implements AlertStoreInterface {
    private alerts: Map<OrderId, AlertMessage> = new Map();

    async create(alert: Omit<AlertMessage, 'id'>): Promise<AlertMessage> {
        const id: OrderId = (Math.random() * 10000).toString() as OrderId;
        const newAlert = { id, ...alert, createdAt: new Date() };
        this.alerts.set(id, newAlert);
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
            return Object.entries(query).every(([key, value]) => alert[key] === value);
        });
    }
}

export class AlertStore {
    private alertStore: AlertStoreInterface;

    constructor(alertStore: AlertStoreInterface) {
        this.alertStore = alertStore;
    }

    async create(alert: Omit<AlertMessage, 'id'>): Promise<AlertMessage> {
        return this.alertStore.create(alert);
    }

    async read(id: OrderId): Promise<AlertMessage | null> {
        return this.alertStore.read(id);
    }

    async update(id: OrderId, alert: Partial<Omit<AlertMessage, 'id'>>): Promise<AlertMessage | null> {
        return this.alertStore.update(id, alert);
    }

    async delete(id: OrderId): Promise<boolean> {
        return this.alertStore.delete(id);
    }

    async findIndex(query: Partial<AlertMessage>): Promise<AlertMessage[]> {
        return this.alertStore.findIndex(query);
    }
}