import { User, UserId, UserSchema } from './types';
import { ValidationError, NotFoundError } from './errors';
import userStore from './inMemoryStore';
import crypto from 'crypto';

export const createUser = async (username: string, email: string): Promise<User> => {
    const userInput = { username, email };
    UserSchema.parse(userInput); // Validate user input
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
    const updatedUserData = { ...user, ...userData };
    UserSchema.parse(updatedUserData); // Validate updated user data
    return userStore.update(id, updatedUserData);
};

export const deleteUser = async (id: UserId): Promise<boolean> => {
    const user = await findUserById(id);
    return userStore.delete(id);
};

export const getAllUsers = async (): Promise<User[]> => {
    return userStore.findAll();
};