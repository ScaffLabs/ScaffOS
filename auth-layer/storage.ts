import { User, UserId } from './types';
import { ValidationError, NotFoundError } from './errors';
import userStore from './inMemoryStore';
import { createConnectionPool } from './database';
import { v4 as uuidv4 } from 'uuid';

const pool = createConnectionPool();

export const createUser = async (username: string, email: string): Promise<User> => {
    const newUser: User = { id: uuidv4() as UserId, username, email };
    try {
        const existingUser = await userStore.findByEmail(email);
        if (existingUser) {
            throw new ValidationError(['Email already in use.']);
        }
        await userStore.create(newUser);
        return newUser;
    } catch (err) {
        throw new Error('Unexpected error occurred while creating user');
    }
};

export const getAllUsers = async (): Promise<User[]> => {
    const users = userStore.findAll();
    if (users.length === 0) {
        throw new NotFoundError('No users found.');
    }
    return users;
};

export const updateUser = async (id: UserId, userData: Partial<User>): Promise<User | null> => {
    const updatedUser = userStore.update(id, userData);
    if (!updatedUser) {
        throw new NotFoundError('User not found for update');
    }
    return updatedUser;
};

export const deleteUser = async (id: UserId): Promise<boolean> => {
    const deleted = userStore.delete(id);
    if (!deleted) {
        throw new NotFoundError('User not found for deletion');
    }
    return true;
};

export const findUserById = async (id: UserId): Promise<User | null> => {
    return userStore.findById(id);
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
    return userStore.findByEmail(email);
};

export const validateUserExistence = async (email: string): Promise<void> => {
    const user = await getUserByEmail(email);
    if (user) {
        throw new ValidationError(['Email already exists.']);
    }
};
