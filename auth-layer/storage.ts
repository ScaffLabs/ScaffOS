import { User, UserId, UserSchema } from './types';
import { ValidationError, NotFoundError, EmptyArrayError } from './errors';
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

// Get All Users
export const getAllUsers = async (): Promise<User[]> => {
    const users = userStore.findAll();
    if (users.length === 0) {
        throw new EmptyArrayError('No users found.');
    }
    return users;
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
