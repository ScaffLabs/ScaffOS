import { Document, Schema } from 'mongoose';
import logger from './logger';

export interface AlertMessage {
    id: string;
    type: 'price' | 'risk';
    threshold: number;
    currentValue: number;
    createdAt: Date;
}

export interface AlertStoreInterface {
    create(alert: Omit<AlertMessage, 'id'>): Promise<AlertMessage>;
    read(id: string): Promise<AlertMessage | null>;
    update(id: string, alert: Partial<Omit<AlertMessage, 'id'>>): Promise<AlertMessage | null>;
    delete(id: string): Promise<boolean>;
    findIndex(query: Partial<AlertMessage>): Promise<AlertMessage[]>;
}

export class InMemoryAlertStore implements AlertStoreInterface {
    private alerts: Map<string, AlertMessage> = new Map();

    async create(alert: Omit<AlertMessage, 'id'>): Promise<AlertMessage> {
        const id = (Math.random() * 10000).toString();
        const newAlert = { id, ...alert, createdAt: new Date() };
        this.alerts.set(id, newAlert);
        return newAlert;
    }

    async read(id: string): Promise<AlertMessage | null> {
        return this.alerts.get(id) || null;
    }

    async update(id: string, alert: Partial<Omit<AlertMessage, 'id'>>): Promise<AlertMessage | null> {
        const existingAlert = this.alerts.get(id);
        if (!existingAlert) return null;
        const updatedAlert = { ...existingAlert, ...alert };
        this.alerts.set(id, updatedAlert);
        return updatedAlert;
    }

    async delete(id: string): Promise<boolean> {
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

    async read(id: string): Promise<AlertMessage | null> {
        return this.alertStore.read(id);
    }

    async update(id: string, alert: Partial<Omit<AlertMessage, 'id'>>): Promise<AlertMessage | null> {
        return this.alertStore.update(id, alert);
    }

    async delete(id: string): Promise<boolean> {
        return this.alertStore.delete(id);
    }

    async findIndex(query: Partial<AlertMessage>): Promise<AlertMessage[]> {
        return this.alertStore.findIndex(query);
    }
}