import { User, UserId } from './types';
import crypto from 'crypto';

interface DataStore<T> {
    create(item: T): T;
    read(id: UserId): T | undefined;
    update(id: UserId, item: Partial<T>): T | null;
    delete(id: UserId): boolean;
    findAll(): T[];
    findByIndex(index: string, value: string): T[];
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

    update(id: UserId, item: Partial<T>): T | null {
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

    private indexItem(id: UserId, item: T) {
        // Example indexing logic based on User's email field
        if ('email' in item) {
            const emailIndex = this.index.get('email') || new Map();
            const emailValue = (item as any).email;
            const ids = emailIndex.get(emailValue) || new Set();
            ids.add(id);
            emailIndex.set(emailValue, ids);
            this.index.set('email', emailIndex);
        }
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