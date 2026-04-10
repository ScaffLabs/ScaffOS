import { User, UserId, UserSchema } from './types';
import { ValidationError, NotFoundError } from './errors';
import userStore from './inMemoryStore';
import { v4 as uuidv4 } from 'uuid';

// Create User
export const createUser = async (username: string, email: string): Promise<User> => {
    const newUser: User = { id: uuidv4() as UserId, username, email };
    try {
        // Validate the user data with Zod schema
        UserSchema.parse(newUser);
        const existingUser = userStore.findByEmail(email);
        if (existingUser) {
            throw new ValidationError(['Email already in use.']);
        }
        return userStore.create(newUser);
    } catch (err) {
        if (err instanceof ValidationError) {
            throw new ValidationError(err.errors.map(e => e.message));
        }
        throw new Error('Unexpected error occurred while creating user');
    }
};

// Update User
export const updateUser = async (id: UserId, userData: Partial<User>): Promise<User | null> => {
    const user = userStore.findById(id);
    if (!user) {
        throw new NotFoundError('User not found for update');
    }
    const updatedUserData = { ...user, ...userData };
    // Validate the updated user data with Zod schema
    UserSchema.parse(updatedUserData);
    return userStore.update(id, updatedUserData);
};

// Delete User
export const deleteUser = async (id: UserId): Promise<boolean> => {
    const user = userStore.findById(id);
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
    // Transaction implementation can be added here later.
    await operations();
};