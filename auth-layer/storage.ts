import { User, UserId, UserSchema } from './types';
import { ValidationError, NotFoundError, EmptyArrayError } from './errors';
import { createConnectionPool } from './database';
import { v4 as uuidv4 } from 'uuid';

const pool = createConnectionPool();

export const createUser = async (username: string, email: string): Promise<User> => {
    const newUser: User = { id: uuidv4() as UserId, username, email };
    try {
        UserSchema.parse(newUser);
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            throw new ValidationError(['Email already in use.']);
        }
        await pool.query('INSERT INTO users (id, username, email) VALUES ($1, $2, $3)', [newUser.id, newUser.username, newUser.email]);
        return newUser;
    } catch (err) {
        if (err instanceof ValidationError) {
            throw new ValidationError(err.errors.map(e => e.message));
        }
        throw new Error('Unexpected error occurred while creating user');
    }
};

export const getAllUsers = async (): Promise<User[]> => {
    const result = await pool.query('SELECT * FROM users');
    const users: User[] = result.rows;
    if (users.length === 0) {
        throw new EmptyArrayError('No users found.');
    }
    return users;
};

export const updateUser = async (id: UserId, userData: Partial<User>): Promise<User | null> => {
    const user = await findUserById(id);
    if (!user) {
        throw new NotFoundError('User not found for update');
    }
    try {
        const updatedUserData = { ...user, ...userData };
        UserSchema.parse(updatedUserData);
        await pool.query('UPDATE users SET username = $1, email = $2 WHERE id = $3', [updatedUserData.username, updatedUserData.email, id]);
        return updatedUserData;
    } catch (error) {
        if (error instanceof ValidationError) {
            throw new ValidationError(error.errors.map(e => e.message));
        }
        throw new Error('Unexpected error occurred while updating user');
    }
};

export const deleteUser = async (id: UserId): Promise<boolean> => {
    const userExists = await findUserById(id);
    if (!userExists) {
        throw new NotFoundError('User not found for deletion');
    }
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return true;
};

export const findUserById = async (id: UserId): Promise<User | null> => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
};

export const createUserTable = async () => {
    await pool.query(`CREATE TABLE IF NOT EXISTS users (` +
        `id UUID PRIMARY KEY,` +
        `username VARCHAR(255) NOT NULL,` +
        `email VARCHAR(255) UNIQUE NOT NULL)` +
    `);`;
};
