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
        // Generate a unique ID for the new user using UUID.
        const id = crypto.randomUUID() as UserId;
        // Create a new item with the generated ID.
        const newItem = { ...item, id };
        // Store the new item in the in-memory store.
        this.store.set(id, newItem);
        // Index the new item for efficient searches.
        this.indexItem(id, newItem);
        return newItem;
    }

    // Other methods...
}

const userStore = new InMemoryStore<User>();

export const createUser = (username: string, email: string): User => {
    // Check if the email is already in use before creating a new user.
    if (findUserByEmail(email)) {
        throw new Error('Email already in use');
    }
    // Create a new user object with a unique ID.
    const user: User = { id: crypto.randomUUID() as UserId, username, email };
    return userStore.create(user);
};

// Other storage functions...