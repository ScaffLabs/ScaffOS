// Import necessary modules
import { User, UserId, UserSchema } from './types';
import { ValidationError, NotFoundError } from './errors';
import userStore from './inMemoryStore';
import { v4 as uuidv4 } from 'uuid';
import { emitUserCreatedEvent } from './eventBus';

// Create User
export const createUser = async (username: string, email: string): Promise<User> => {
    const newUser: User = { id: uuidv4() as UserId, username, email };
    try {
        UserSchema.parse(newUser);
    } catch (err) {
        throw new ValidationError(err.errors.map(e => e.message));
    }
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        throw new ValidationError(['Email already in use.']);
    }
    userStore.create(newUser);
    emitUserCreatedEvent(newUser); // Emit event after user creation
    return newUser;
};

// Update User
export const updateUser = async (id: UserId, userData: Partial<User>): Promise<User | null> => {
    const user = await findUserById(id);
    if (!user) {
        throw new NotFoundError('User not found for update');
    }
    const updatedUser = { ...user, ...userData };
    try {
        UserSchema.parse(updatedUser);
    } catch (err) {
        throw new ValidationError(err.errors.map(e => e.message));
    }
    return userStore.update(id, updatedUser);
};

// Delete User
export const deleteUser = async (id: UserId): Promise<boolean> => {
    const user = await findUserById(id);
    if (!user) {
        throw new NotFoundError('User not found for deletion');
    }
    return userStore.delete(id);
};

// Get All Users
export const getAllUsers = async (): Promise<User[]> => {
    return userStore.findAll();
};

// Find User by ID
export const findUserById = async (id: UserId): Promise<User | null> => {
    return userStore.findById(id);
};

// Find User by Email
export const findUserByEmail = async (email: string): Promise<User | null> => {
    return userStore.findByEmail(email);
};

// Transaction Support
export const transaction = async (operations: () => Promise<void>) => {
    try {
        await operations();
    } catch (error) {
        throw error;
    }
};