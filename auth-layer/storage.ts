import { User, UserId } from './types';
import crypto from 'crypto';

interface DataStore<T> {
    create(item: T): T;
    read(id: UserId): T | undefined;
    update(id: UserId, item: T): T | null;
    delete(id: UserId): boolean;
    findAll(): T[];
}

class InMemoryStore<T> implements DataStore<T> {
    private store: Map<UserId, T> = new Map();

    create(item: T): T {
        const id = crypto.randomUUID() as UserId; // Use branded type
        this.store.set(id, { ...item, id });
        return this.store.get(id)!;
    }

    read(id: UserId): T | undefined {
        return this.store.get(id);
    }

    update(id: UserId, item: T): T | null {
        if (!this.store.has(id)) return null;
        this.store.set(id, { ...item, id });
        return this.store.get(id)!;
    }

    delete(id: UserId): boolean {
        return this.store.delete(id);
    }

    findAll(): T[] {
        return Array.from(this.store.values());
    }
}

const userStore = new InMemoryStore<User>();

export const createUser = (username: string, email: string): User => {
    const user: User = { id: crypto.randomUUID() as UserId, username, email };
    return userStore.create(user);
};

export const findUserById = (id: UserId): User | undefined => {
    return userStore.read(id);
};

export const updateUser = (id: UserId, userData: Partial<User>): User | null => {
    return userStore.update(id, { ...userData, id });
};

export const deleteUser = (id: UserId): boolean => {
    return userStore.delete(id);
};

export const getAllUsers = (): User[] => {
    return userStore.findAll();
};

export default userStore;