import { User, UserId, UserSchema } from './types';
import { ValidationError, NotFoundError } from './errors';
import userStore from './inMemoryStore';
import { v4 as uuidv4 } from 'uuid';

export const createUser = async (username: string, email: string): Promise<User> => {
    const newUser: User = { id: uuidv4() as UserId, username, email };
    try {
        UserSchema.parse(newUser); // Validate user data
    } catch (err) {
        throw new ValidationError(err.errors.map(e => e.message));
    }
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        throw new ValidationError(['Email already in use.']);
    }
    userStore.create(newUser);
    return newUser;
};

export const updateUser = async (id: UserId, userData: Partial<User>): Promise<User | null> => {
    const user = await findUserById(id);
    if (!user) {
        throw new NotFoundError('User not found for update');
    }
    const updatedUser = { ...user, ...userData };
    try {
        UserSchema.parse(updatedUser); // Validate updated user data
    } catch (err) {
        throw new ValidationError(err.errors.map(e => e.message));
    }
    return userStore.update(id, updatedUser);
};

export const deleteUser = async (id: UserId): Promise<boolean> => {
    return userStore.delete(id);
};

export const getAllUsers = async (): Promise<User[]> => {
    return userStore.findAll();
};