import { User, UserId } from './types';
import { ValidationError, NotFoundError } from './errors';
import { createConnectionPool } from './database';
import crypto from 'crypto';

const pool = createConnectionPool();

export const createUser = async (username: string, email: string): Promise<User> => {
    try {
        if (!username || !email) {
            throw new ValidationError(['Username and email are required.']);
        }
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            throw new ValidationError(['Email already in use.']);
        }
        const id: UserId = crypto.randomUUID() as UserId;
        const user = { id, username, email };
        await pool.query('INSERT INTO users (id, username, email) VALUES ($1, $2, $3)', [id, username, email]);
        return user;
    } catch (error) {
        if (error instanceof ValidationError) throw error;
        throw new ServiceError('Error creating user: ' + error.message);
    }
};

export const updateUser = async (id: UserId, userData: Partial<User>): Promise<User | null> => {
    try {
        const user = await findUserById(id);
        if (!user) {
            throw new NotFoundError('User not found.');
        }
        const updatedUser = { ...user, ...userData };
        await pool.query('UPDATE users SET username = $1, email = $2 WHERE id = $3', [updatedUser.username, updatedUser.email, id]);
        return updatedUser;
    } catch (error) {
        if (error instanceof NotFoundError) throw error;
        throw new ServiceError('Error updating user: ' + error.message);
    }
};