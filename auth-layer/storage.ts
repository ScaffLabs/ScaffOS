import { User, UserId } from './types';
import { ValidationError, NotFoundError } from './errors';
import userStore from './inMemoryStore';
import { createConnectionPool } from './database';
import crypto from 'crypto';

const pool = createConnectionPool();

export const createUser = async (username: string, email: string): Promise<User> => {
    if (!username || !email) {
        throw new ValidationError(['Username and email are required.']);
    }
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        throw new ValidationError(['Email already in use.']);
    }
    const id: UserId = crypto.randomUUID() as UserId;
    const user: User = { id, username, email };
    userStore.create(user);
    return user;
};

export const findUserById = async (id: UserId): Promise<User | null> => {
    const user = userStore.findById(id);
    if (!user) {
        throw new NotFoundError('User not found.');
    }
    return user;
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
    const users = userStore.findAll();
    return users.find(user => user.email === email) || null;
};

export const updateUser = async (id: UserId, userData: Partial<User>): Promise<User | null> => {
    const user = await findUserById(id);
    return userStore.update(id, userData);
};

export const deleteUser = async (id: UserId): Promise<boolean> => {
    const user = await findUserById(id);
    return userStore.delete(id);
};

export const getAllUsers = async (): Promise<User[]> => {
    return userStore.findAll();
};