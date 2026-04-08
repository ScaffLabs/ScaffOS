// storage.ts
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
        throw new Error('Error creating user: ' + error.message);
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
        throw new Error('Error updating user: ' + error.message);
    }
};

export const deleteUser = async (id: UserId): Promise<boolean> => {
    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
        return result.rowCount > 0;
    } catch (error) {
        throw new Error('Error deleting user: ' + error.message);
    }
};

export const findUserById = async (id: UserId): Promise<User | undefined> => {
    try {
        const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return res.rows[0];
    } catch (error) {
        throw new Error('Error finding user by id: ' + error.message);
    }
};

export const findUserByEmail = async (email: string): Promise<User | undefined> => {
    try {
        const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return res.rows[0];
    } catch (error) {
        throw new Error('Error finding user by email: ' + error.message);
    }
};

export const getAllUsers = async (): Promise<User[]> => {
    try {
        const res = await pool.query('SELECT * FROM users');
        return res.rows;
    } catch (error) {
        throw new Error('Error retrieving all users: ' + error.message);
    }
};

export const transaction = async (callback: () => Promise<void>) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await callback();
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw new Error('Transaction error: ' + error.message);
    } finally {
        client.release();
    }
};
