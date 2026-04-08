import { User, UserId } from './types';
import { ValidationError, NotFoundError } from './errors';
import { createConnectionPool } from './database';
import crypto from 'crypto';

const pool = createConnectionPool();

export const createUser = async (username: string, email: string): Promise<User> => {
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
};

export const findUserById = async (id: UserId): Promise<User | null> => {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0] || null;
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0] || null;
};

export const updateUser = async (id: UserId, userData: Partial<User>): Promise<User | null> => {
    const user = await findUserById(id);
    if (!user) {
        throw new NotFoundError('User not found.');
    }
    const updatedUser = { ...user, ...userData };
    await pool.query('UPDATE users SET username = $1, email = $2 WHERE id = $3', [updatedUser.username, updatedUser.email, id]);
    return updatedUser;
};

export const deleteUser = async (id: UserId): Promise<boolean> => {
    const res = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return res.rowCount > 0;
};

export const getAllUsers = async (): Promise<User[]> => {
    const res = await pool.query('SELECT * FROM users');
    return res.rows;
};
