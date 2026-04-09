import { User, UserId } from './types';
import { ValidationError, NotFoundError } from './errors';
import userStore from './inMemoryStore';
import { v4 as uuidv4 } from 'uuid';
import { validateUser, sanitizeUserInput } from './userValidation';

export const createUser = async (username: string, email: string): Promise<User> => {
    const sanitizedInput = sanitizeUserInput({ username, email });
    validateUser(sanitizedInput);
    const existingUser = await findUserByEmail(sanitizedInput.email);
    if (existingUser) {
        throw new ValidationError(['Email already in use.']);
    }
    const id: UserId = uuidv4() as UserId;
    const newUser: User = { id, username: sanitizedInput.username, email: sanitizedInput.email };
    userStore.create(newUser);
    return newUser;
};

export const updateUser = async (id: UserId, userData: Partial<User>): Promise<User | null> => {
    const sanitizedInput = sanitizeUserInput(userData);
    validateUser(sanitizedInput);
    const updatedUser = userStore.update(id, sanitizedInput);
    if (!updatedUser) {
        throw new NotFoundError('User not found for update');
    }
    return updatedUser;
};

export const deleteUser = async (id: UserId): Promise<boolean> => {
    return userStore.delete(id);
};

export const performTransaction = async (operations: (() => Promise<any>)[]): Promise<void> => {
    try {
        await Promise.all(operations.map(op => op()));
    } catch (error) {
        throw new Error('Transaction failed, rolling back');
    }
};