import { User, UserId } from './types';
import { ValidationError, NotFoundError } from './errors';
import InMemoryUserStore from './inMemoryStore';
import { createConnectionPool } from './database';
import { v4 as uuidv4 } from 'uuid';

const pool = createConnectionPool();
const userStore = new InMemoryUserStore();

export const createUser = async (username: string, email: string): Promise<User> => {
    const existingUser = await userStore.findByEmail(email);
    if (existingUser) {
        throw new ValidationError(['Email already in use.']);
    }
    const id: UserId = uuidv4() as UserId;
    const newUser: User = { id, username, email };
    return userStore.create(newUser);
};

export const findUserById = async (id: UserId): Promise<User | null> => {
    const user = userStore.findById(id);
    if (!user) {
        throw new NotFoundError('User not found.');
    }
    return user;
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
    return userStore.findByEmail(email);
};

export const updateUser = async (id: UserId, userData: Partial<User>): Promise<User | null> => {
    const updatedUser = userStore.update(id, userData);
    if (!updatedUser) {
        throw new NotFoundError('User not found for update');
    }
    return updatedUser;
};

export const deleteUser = async (id: UserId): Promise<boolean> => {
    return userStore.delete(id);
};

export const getAllUsers = async (): Promise<User[]> => {
    return userStore.findAll();
};