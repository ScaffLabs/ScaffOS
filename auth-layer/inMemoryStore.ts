import { User, UserId } from './types';
import { ValidationError } from './errors';

interface InMemoryStore<T> {
    create(item: T): T;
    findById(id: UserId): T | null;
    update(id: UserId, item: Partial<T>): T | null;
    delete(id: UserId): boolean;
    findByEmail(email: string): T | null;
    findAll(): T[];
}

class InMemoryUserStore implements InMemoryStore<User> {
    private users: Map<UserId, User> = new Map();

    create(user: User): User {
        if (this.users.has(user.id)) {
            throw new ValidationError(['User already exists.']);
        }
        this.users.set(user.id, user);
        return user;
    }

    findById(id: UserId): User | null {
        return this.users.get(id) || null;
    }

    findByEmail(email: string): User | null {
        for (const user of this.users.values()) {
            if (user.email === email) return user;
        }
        return null;
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
}

const userStore = new InMemoryUserStore();
export default userStore;
