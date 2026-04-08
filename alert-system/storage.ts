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
    startTransaction(): Promise<void>;
    commitTransaction(): Promise<void>;
    rollbackTransaction(): Promise<void>;
}

export class InMemoryAlertStore implements AlertStoreInterface {
    private alerts: Map<string, AlertMessage> = new Map();
    private transactionAlerts: Map<string, AlertMessage> = new Map();
    private inTransaction: boolean = false;

    async create(alert: Omit<AlertMessage, 'id'>): Promise<AlertMessage> {
        const id = (Math.random() * 10000).toString();
        const newAlert = { id, ...alert, createdAt: new Date() };
        if (this.inTransaction) {
            this.transactionAlerts.set(id, newAlert);
        } else {
            this.alerts.set(id, newAlert);
        }
        return newAlert;
    }

    async read(id: string): Promise<AlertMessage | null> {
        return this.alerts.get(id) || null;
    }

    async update(id: string, alert: Partial<Omit<AlertMessage, 'id'>>): Promise<AlertMessage | null> {
        const existingAlert = this.alerts.get(id);
        if (!existingAlert) return null;
        const updatedAlert = { ...existingAlert, ...alert };
        if (this.inTransaction) {
            this.transactionAlerts.set(id, updatedAlert);
        } else {
            this.alerts.set(id, updatedAlert);
        }
        return updatedAlert;
    }

    async delete(id: string): Promise<boolean> {
        const result = this.alerts.delete(id);
        if (this.inTransaction) {
            this.transactionAlerts.delete(id);
        }
        return result;
    }

    async findIndex(query: Partial<AlertMessage>): Promise<AlertMessage[]> {
        return Array.from(this.alerts.values()).filter(alert => {
            return Object.entries(query).every(([key, value]) => alert[key] === value);
        });
    }

    async startTransaction(): Promise<void> {
        this.inTransaction = true;
        this.transactionAlerts.clear();
    }

    async commitTransaction(): Promise<void> {
        this.inTransaction = false;
        for (const alert of this.transactionAlerts.values()) {
            this.alerts.set(alert.id, alert);
        }
        this.transactionAlerts.clear();
    }

    async rollbackTransaction(): Promise<void> {
        this.inTransaction = false;
        this.transactionAlerts.clear();
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