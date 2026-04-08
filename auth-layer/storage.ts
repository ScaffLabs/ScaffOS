import { User, UserId, UserSchema } from './types';
import crypto from 'crypto';
import sanitizeHtml from 'sanitize-html';
import { ValidationError } from './errors';

const sanitizeInput = (input: string) => {
    return sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} });
};

interface DataStore<T> {
    create(item: T): T;
    read(id: UserId): T | undefined;
    update(id: UserId, item: Partial<T>): T | null;
    delete(id: UserId): boolean;
    findAll(limit?: number, offset?: number, sortBy?: keyof T, order?: 'asc' | 'desc'): T[];
}

class InMemoryStore<T> implements DataStore<T> {
    private store: Map<UserId, T> = new Map();

    create(item: T): T {
        const id = crypto.randomUUID() as UserId;
        this.store.set(id, item);
        return { ...item, id };
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

    findAll(limit = 10, offset = 0, sortBy: keyof T = 'username', order: 'asc' | 'desc' = 'asc'): T[] {
        const items = Array.from(this.store.values());
        const sortedItems = items.sort((a, b) => {
            if (order === 'asc') return a[sortBy] > b[sortBy] ? 1 : -1;
            return a[sortBy] < b[sortBy] ? 1 : -1;
        });
        return sortedItems.slice(offset, offset + limit);
    }
}

const userStore = new InMemoryStore<User>();

export const createUser = (username: string, email: string): User => {
    const sanitizedUsername = sanitizeInput(username);
    const sanitizedEmail = sanitizeInput(email);
    try {
        UserSchema.parse({ username: sanitizedUsername, email: sanitizedEmail });
    } catch (error) {
        throw new ValidationError(error.errors.map((err: any) => err.message));
    }
    if (userStore.findByIndex('email', sanitizedEmail).length > 0) {
        throw new Error('Email already in use');
    }
    const user: User = { id: crypto.randomUUID() as UserId, username: sanitizedUsername, email: sanitizedEmail };
    return userStore.create(user);
};

export const updateUser = (id: UserId, userData: Partial<User>): User | null => {
    if (userData.username) userData.username = sanitizeInput(userData.username);
    if (userData.email) userData.email = sanitizeInput(userData.email);
    return userStore.update(id, userData);
};

export const deleteUser = (id: UserId): boolean => {
    return userStore.delete(id);
};

export const findUserById = (id: UserId): User | undefined => {
    return userStore.read(id);
};

export const getAllUsers = (limit?: number, offset?: number, sortBy?: keyof User, order?: 'asc' | 'desc'): User[] => {
    return userStore.findAll(limit, offset, sortBy, order);
};

export default userStore;