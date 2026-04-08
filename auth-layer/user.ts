import crypto from 'crypto';

export interface User {
    id: string;
    username: string;
    email: string;
}

const users: User[] = [];

export const createUser = (username: string, email: string): User => {
    if (findUserByEmail(email)) {
        throw new Error('Email already in use');
    }
    const user: User = { id: crypto.randomUUID(), username, email };
    users.push(user);
    return user;
};

export const findUserById = (id: string): User | undefined => {
    return users.find(user => user.id === id);
};

export const findUserByEmail = (email: string): User | undefined => {
    return users.find(user => user.email === email);
};

export const updateUser = (id: string, userData: Partial<User>): User | null => {
    const user = findUserById(id);
    if (!user) return null;
    const updatedUser = { ...user, ...userData };
    const userIndex = users.findIndex(u => u.id === id);
    users[userIndex] = updatedUser;
    return updatedUser;
};

export const deleteUser = (id: string): boolean => {
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return false;
    users.splice(index, 1);
    return true;
};

export const getAllUsers = (): User[] => {
    return [...users];
};

export default users;