import { User, UserId } from './types';
import crypto from 'crypto';

interface DataStore<T> {
    create(item: T): T;
    read(id: UserId): T | undefined;
    update(id: UserId, item: T): T | null;
    delete(id: UserId): boolean;
    findAll(): T[];
    findByIndex(index: string, value: string): T[];
}

class InMemoryStore<T> implements DataStore<T> {
    private store: Map<UserId, T> = new Map();
    private index: Map<string, Map<string, Set<UserId>>> = new Map();

    create(item: T): T {
        const id = crypto.randomUUID() as UserId;
        this.store.set(id, { ...item, id });
        this.indexItem(id, item);
        return this.store.get(id)!;
    }

    read(id: UserId): T | undefined {
        return this.store.get(id);
    }

    update(id: UserId, item: T): T | null {
        if (!this.store.has(id)) return null;
        this.store.set(id, { ...item, id });
        this.reindexItem(id, item);
        return this.store.get(id)!;
    }

    delete(id: UserId): boolean {
        const item = this.store.get(id);
        if (item) {
            this.removeIndex(id, item);
        }
        return this.store.delete(id);
    }

    findAll(): T[] {
        return Array.from(this.store.values());
    }

    findByIndex(index: string, value: string): T[] {
        const indexMap = this.index.get(index);
        if (!indexMap) return [];
        const ids = indexMap.get(value);
        if (!ids) return [];
        return Array.from(ids).map(id => this.store.get(id)!);
    }

    private indexItem(id: UserId, item: T) {
        const indexKeys = Object.keys(item);
        for (const key of indexKeys) {
            if (!this.index.has(key)) {
                this.index.set(key, new Map());
            }
            const indexMap = this.index.get(key)!;
            const value = (item as any)[key];
            if (!indexMap.has(value)) {
                indexMap.set(value, new Set());
            }
            indexMap.get(value)!.add(id);
        }
    }

    private reindexItem(id: UserId, item: T) {
        const previousItem = this.store.get(id);
        if (previousItem) {
            this.removeIndex(id, previousItem);
        }
        this.indexItem(id, item);
    }

    private removeIndex(id: UserId, item: T) {
        const indexKeys = Object.keys(item);
        for (const key of indexKeys) {
            const indexMap = this.index.get(key);
            if (indexMap) {
                const value = (item as any)[key];
                const ids = indexMap.get(value);
                if (ids) {
                    ids.delete(id);
                    if (ids.size === 0) {
                        indexMap.delete(value);
                    }
                }
            }
        }
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

export const migrateData = async (seedData: User[]) => {
    for (const user of seedData) {
        userStore.create(user);
    }
};