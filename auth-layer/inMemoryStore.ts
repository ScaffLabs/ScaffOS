import { User, UserId } from './types';
import { ValidationError, NotFoundError } from './errors';

interface InMemoryStore<T> {
    create(item: T): T;
    findById(id: UserId): T | null;
    update(id: UserId, item: Partial<T>): T | null;
    delete(id: UserId): boolean;
    findAll(): T[];
    transaction(callback: () => void): void;
}

class InMemoryUserStore implements InMemoryStore<User> {
    private users: Map<UserId, User> = new Map();

    create(user: User): User {
        this.users.set(user.id, user);
        return user;
    }

    findById(id: UserId): User | null {
        return this.users.get(id) || null;
    }

    update(id: UserId, userData: Partial<User>): User | null {
        const user = this.findById(id);
        if (!user) return null;
        const updatedUser = { ...user, ...userData };
        this.users.set(id, updatedUser);
        return updatedUser;
    }

    delete(id: UserId): boolean {
        return this.users.delete(id);
    }

    findAll(): User[] {
        return Array.from(this.users.values());
    }

    transaction(callback: () => void): void {
        const originalState = new Map(this.users);
        try {
            callback();
        } catch (error) {
            this.users = originalState;
            throw error;
        }
    }
}

const userStore = new InMemoryUserStore();
export default userStore;  
