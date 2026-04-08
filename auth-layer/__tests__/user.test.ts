import { createUser, findUserById, updateUser, deleteUser, getAllUsers } from '../storage';
import { User } from '../user';

describe('User Service Functions', () => {
    const testUser = { username: 'testuser', email: 'test@example.com' };
    let createdUser: User;

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
});