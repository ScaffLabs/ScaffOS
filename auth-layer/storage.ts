import { User, UserId } from './types';

// In-memory store for users
const users: Map<UserId, User> = new Map();

export const createUser = (username: string, email: string): User => {
    const id: UserId = crypto.randomUUID() as UserId;
    const user: User = { id, username, email };
    if (findUserByEmail(email)) {
        throw new Error('Email already in use');
    }
    users.set(id, user);
    return user;
};

export const updateUser = (id: UserId, userData: Partial<User>): User | null => {
    const user = users.get(id);
    if (!user) return null;
    const updatedUser = { ...user, ...userData };
    users.set(id, updatedUser);
    return updatedUser;
};

export const deleteUser = (id: UserId): boolean => {
    return users.delete(id);
};

export const findUserById = (id: UserId): User | undefined => {
    return users.get(id);
};

export const getAllUsers = (): User[] => {
    return Array.from(users.values());
};

export const transaction = (callback: () => void) => {
    const backup = new Map(users);
    try {
        callback();
    } catch (error) {
        users.clear();
        backup.forEach((user, id) => users.set(id, user));
        throw error;
    }
};

export default { createUser, updateUser, deleteUser, findUserById, getAllUsers, transaction };