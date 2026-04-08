import { User, UserId } from './types';
import crypto from 'crypto';

interface DataStore<T> {
    create(item: T): T;
    read(id: UserId): T | undefined;
    update(id: UserId, item: T): T | null;
    delete(id: UserId): boolean;
    findAll(): T[];
    findByIndex(index: string, value: string): T[];
    transaction(operations: (store: this) => void): void;
}

class InMemoryStore<T> implements DataStore<T> {
    private store: Map<UserId, T> = new Map();
    private index: Map<string, Map<string, Set<UserId>>> = new Map();

    create(item: T): T {
        const id = crypto.randomUUID() as UserId;
        const newItem = { ...item, id };
        this.store.set(id, newItem);
        this.indexItem(id, newItem);
        return newItem;
    }

    read(id: UserId): T | undefined {
        return this.store.get(id);
    }

    update(id: UserId, item: T): T | null {
        const existingItem = this.store.get(id);
        if (!existingItem) return null;
        const updatedItem = { ...existingItem, ...item };
        this.store.set(id, updatedItem);
        return updatedItem;
    }

    delete(id: UserId): boolean {
        return this.store.delete(id);
    }

    findAll(): T[] {
        return Array.from(this.store.values());
    }

    findByIndex(index: string, value: string): T[] {
        const indexMap = this.index.get(index);
        if (!indexMap) return [];
        const ids = indexMap.get(value);
        return ids ? Array.from(ids).map(id => this.store.get(id)).filter(Boolean) as T[] : [];
    }

    transaction(operations: (store: this) => void): void {
        const originalStore = new Map(this.store);
        try {
            operations(this);
        } catch (error) {
            this.store = originalStore; // Rollback on error
            throw error;
        }
    }

    private indexItem(id: UserId, item: T) {
        // Indexing logic here (for example, based on username or email)
    }
}

const userStore = new InMemoryStore<User>();

export const createUser = (username: string, email: string): User => {
    if (userStore.findByIndex('email', email).length > 0) {
        throw new Error('Email already in use');
    }
    const user: User = { id: crypto.randomUUID() as UserId, username, email };
    return userStore.create(user);
};

export const findUserById = (id: UserId): User | undefined => {
    return userStore.read(id);
};

export const updateUser = (id: UserId, userData: Partial<User>): User | null => {
    return userStore.update(id, userData);
};

export const deleteUser = (id: UserId): boolean => {
    return userStore.delete(id);
};

export const getAllUsers = (): User[] => {
    return userStore.findAll();
};

export default userStore;