import { User, UserId } from './types';
import { ValidationError, NotFoundError } from './errors';
import { createConnectionPool } from './database';
import { v4 as uuidv4 } from 'uuid';

const pool = createConnectionPool();

export const createUser = async (username: string, email: string): Promise<User> => {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        throw new ValidationError(['Email already in use.']);
    }
    const id: UserId = uuidv4() as UserId;
    const newUser: User = { id, username, email };
    const query = 'INSERT INTO users (id, username, email) VALUES ($1, $2, $3) RETURNING *';
    const result = await pool.query(query, [id, username, email]);
    return result.rows[0];
};

export const findUserById = async (id: UserId): Promise<User | null> => {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    if (result.rowCount === 0) {
        throw new NotFoundError('User not found.');
    }
    return result.rows[0];
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rowCount ? result.rows[0] : null;
};

export const updateUser = async (id: UserId, userData: Partial<User>): Promise<User | null> => {
    const user = await findUserById(id);
    const updatedUserData = { ...user, ...userData };
    const query = 'UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING *';
    const result = await pool.query(query, [updatedUserData.username, updatedUserData.email, id]);
    if (result.rowCount === 0) {
        throw new NotFoundError('User not found for update');
    }
    return result.rows[0];
};

export const deleteUser = async (id: UserId): Promise<boolean> => {
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return result.rowCount > 0;
};

export const getAllUsers = async (): Promise<User[]> => {
    const result = await pool.query('SELECT * FROM users');
    return result.rows;
};