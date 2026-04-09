import { User, UserId } from './types';
import { ValidationError, NotFoundError } from './errors';
import { createConnectionPool } from './database';
import { v4 as uuidv4 } from 'uuid';
import { validateUser, sanitizeUserInput } from './userValidation';

const pool = createConnectionPool();

export const createUser = async (username: string, email: string): Promise<User> => {
    const sanitizedInput = sanitizeUserInput({ username, email });
    validateUser(sanitizedInput);  // Validate input
    const existingUser = await findUserByEmail(sanitizedInput.email);
    if (existingUser) {
        throw new ValidationError(['Email already in use.']);
    }
    const id: UserId = uuidv4() as UserId;
    const newUser: User = { id, username: sanitizedInput.username, email: sanitizedInput.email };
    await pool.query('INSERT INTO users (id, username, email) VALUES ($1, $2, $3)', [id, sanitizedInput.username, sanitizedInput.email]);
    return newUser;
};

export const findUserById = async (id: UserId): Promise<User | null> => {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (res.rows.length === 0) {
        throw new NotFoundError('User not found.');
    }
    return res.rows[0];
};

export const updateUser = async (id: UserId, userData: Partial<User>): Promise<User | null> => {
    const sanitizedInput = sanitizeUserInput(userData);
    validateUser(sanitizedInput);
    const updatedUser = await pool.query('UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING *', [sanitizedInput.username, sanitizedInput.email, id]);
    if (updatedUser.rowCount === 0) {
        throw new NotFoundError('User not found for update');
    }
    return updatedUser.rows[0];
};

export const deleteUser = async (id: UserId): Promise<boolean> => {
    const res = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return res.rowCount > 0;
};

export const getAllUsers = async (): Promise<User[]> => {
    const res = await pool.query('SELECT * FROM users');
    return res.rows;
};
