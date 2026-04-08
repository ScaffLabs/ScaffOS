import { User } from './user';

interface DataStore<T> {
    create(item: T): T;
    read(id: string): T | undefined;
    update(id: string, item: T): T | null;
    delete(id: string): boolean;
    findAll(): T[];
    transaction(operations: () => Promise<void>): Promise<void>;
}

class InMemoryStore<T> implements DataStore<T> {
    private store: Map<string, T> = new Map();

    create(item: T): T {
        const id = (item as any).id || crypto.randomUUID();
        this.store.set(id, { ...item, id });
        return this.store.get(id)!;
    }

    read(id: string): T | undefined {
        return this.store.get(id);
    }

    update(id: string, item: T): T | null {
        if (!this.store.has(id)) return null;
        this.store.set(id, { ...item, id });
        return this.store.get(id)!;
    }

    delete(id: string): boolean {
        return this.store.delete(id);
    }

    findAll(): T[] {
        return Array.from(this.store.values());
    }

    async transaction(operations: () => Promise<void>): Promise<void> {
        const backup = new Map(this.store);
        try {
            await operations();
        } catch (error) {
            this.store = backup; // Rollback on error
            throw error;
        }
    }
}

const userStore = new InMemoryStore<User>();

export const createUser = (username: string, email: string): User => {
    return userStore.create({ username, email } as User);
};

export const findUserById = (id: string): User | undefined => {
    return userStore.read(id);
};

export const updateUser = (id: string, userData: Partial<User>): User | null => {
    return userStore.update(id, { ...userData, id } as User);
};

export const deleteUser = (id: string): boolean => {
    return userStore.delete(id);
};

export const getAllUsers = (): User[] => {
    return userStore.findAll();
};

export default userStore;