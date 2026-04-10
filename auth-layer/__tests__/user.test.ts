import { createUser, findUserById, updateUser, deleteUser, getAllUsers } from '../storage';
import { ValidationError } from '../errors';

describe('User Service Functions', () => {
    const testUser = { username: 'testuser', email: 'test@example.com' };
    let createdUser;

    it('should create a user', () => {
        createdUser = createUser(testUser.username, testUser.email);
        expect(createdUser).toHaveProperty('id');
        expect(createdUser.username).toBe(testUser.username);
        expect(createdUser.email).toBe(testUser.email);
    });

    it('should find a user by ID', () => {
        const foundUser = findUserById(createdUser.id);
        expect(foundUser).toEqual(createdUser);
    });

    it('should update a user', () => {
        const updatedUser = updateUser(createdUser.id, { username: 'updateduser' });
        expect(updatedUser).toHaveProperty('username', 'updateduser');
    });

    it('should delete a user', () => {
        const deleted = deleteUser(createdUser.id);
        expect(deleted).toBe(true);
        const foundUser = findUserById(createdUser.id);
        expect(foundUser).toBeUndefined();
    });

    it('should return all users', () => {
        const users = getAllUsers();
        expect(users).toEqual([]);
    });

    it('should throw error when creating user with existing email', () => {
        createUser(testUser.username, testUser.email);
        expect(() => createUser(testUser.username, testUser.email)).toThrow(ValidationError);
    });

    it('should throw error when updating non-existent user', () => {
        expect(() => updateUser('non-existent-id', { username: 'updateduser' })).toThrow(Error);
    });
});