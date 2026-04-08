import { User, UserId, UserSchema } from './types';
import { Pool } from 'pg';
import crypto from 'crypto';
import { ValidationError } from './errors';
import config from './config';

const pool = new Pool({
    connectionString: config.DATABASE_URL,
});

const sanitizeInput = (input: string) => {
    return input.replace(/<[^>]*>/g, ''); // Basic XSS prevention
};

export const createUser = async (username: string, email: string): Promise<User> => {
    const sanitizedUsername = sanitizeInput(username);
    const sanitizedEmail = sanitizeInput(email);
    try {
        UserSchema.parse({ username: sanitizedUsername, email: sanitizedEmail });
    } catch (error) {
        throw new ValidationError(error.errors.map((err: any) => err.message));
    }
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [sanitizedEmail]);
    if (existingUser.rowCount > 0) {
        throw new Error('Email already in use');
    }
    const id = crypto.randomUUID() as UserId;
    await pool.query('INSERT INTO users (id, username, email) VALUES ($1, $2, $3)', [id, sanitizedUsername, sanitizedEmail]);
    return { id, username: sanitizedUsername, email: sanitizedEmail };
};

export const updateUser = async (id: UserId, userData: Partial<User>): Promise<User | null> => {
    const { username, email } = userData;
    if (username) {
        userData.username = sanitizeInput(username);
    }
    if (email) {
        userData.email = sanitizeInput(email);
    }
    const result = await pool.query('UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING *', [userData.username, userData.email, id]);
    return result.rows[0] || null;
};

export const deleteUser = async (id: UserId): Promise<boolean> => {
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return result.rowCount > 0;
};

export const findUserById = async (id: UserId): Promise<User | undefined> => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
};

export const getAllUsers = async (): Promise<User[]> => {
    const result = await pool.query('SELECT * FROM users');
    return result.rows;
};

export default { createUser, updateUser, deleteUser, findUserById, getAllUsers };