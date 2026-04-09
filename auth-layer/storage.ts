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

export const migrateData = async (data: User[]) => {
    data.forEach(user => {
        try {
            userStore.create(user);
        } catch (error) {
            console.warn(`Failed to create user ${user.email}: ${error.message}`);
        }
    });
};

export const clearData = () => {
    userStore.findAll().forEach(user => userStore.delete(user.id));
};

export const seedData = async () => {
    clearData();
    const seedData = await readSeedData();
    await migrateData(seedData);
};

const readSeedData = () => {
    // Implement function to read seed data from a file or define it statically
    return [
        { id: '1', username: 'testuser1', email: 'test1@example.com' },
        { id: '2', username: 'testuser2', email: 'test2@example.com' },
        { id: '3', username: 'testuser3', email: 'test3@example.com' }
    ];
};
