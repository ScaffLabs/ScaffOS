// Import necessary modules
import { User, UserId, UserSchema } from './types';
import { ValidationError, NotFoundError } from './errors';
import { createConnectionPool } from './database';
import { v4 as uuidv4 } from 'uuid';

const pool = createConnectionPool();

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
    await pool.query('INSERT INTO users (id, username, email) VALUES ($1, $2, $3)', [newUser.id, newUser.username, newUser.email]);
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
    await pool.query('UPDATE users SET username = $1, email = $2 WHERE id = $3', [updatedUser.username, updatedUser.email, id]);
    return updatedUser;
};

// Delete User
export const deleteUser = async (id: UserId): Promise<boolean> => {
    const user = await findUserById(id);
    if (!user) {
        throw new NotFoundError('User not found for deletion');
    }
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return true;
};

// Get All Users
export const getAllUsers = async (): Promise<User[]> => {
    const result = await pool.query('SELECT * FROM users');
    return result.rows;
};

// Find User by ID
export const findUserById = async (id: UserId): Promise<User | null> => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return result.rows[0];
};

// Find User by Email
export const findUserByEmail = async (email: string): Promise<User | null> => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return null;
    return result.rows[0];
};

// Transaction Support
export const transaction = async (operations: () => Promise<void>) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await operations();
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};