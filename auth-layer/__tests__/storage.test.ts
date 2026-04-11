import { createUser, findUserById, updateUser, deleteUser, getAllUsers } from '../storage';
import { ValidationError, NotFoundError } from '../errors';
import { User } from '../types';

describe('User Storage Functions', () => {
    const testUser = { username: 'testuser', email: 'test@example.com' };
    let createdUser: User;

    it('should create a user', async () => {
        createdUser = await createUser(testUser.username, testUser.email);
        expect(createdUser).toHaveProperty('id');
        expect(createdUser.username).toBe(testUser.username);
        expect(createdUser.email).toBe(testUser.email);
    });

    it('should find a user by ID', async () => {
        const foundUser = await findUserById(createdUser.id);
        expect(foundUser).toEqual(createdUser);
    });

    it('should throw an error when creating a user with existing email', async () => {
        await createUser(testUser.username, testUser.email);
        await expect(createUser(testUser.username, testUser.email)).rejects.toThrow(ValidationError);
    });

    it('should update a user', async () => {
        const updatedUser = await updateUser(createdUser.id, { username: 'updateduser' });
        expect(updatedUser).toHaveProperty('username', 'updateduser');
    });

    it('should throw error when updating non-existent user', async () => {
        await expect(updateUser('non-existent-id', { username: 'updateduser' })).rejects.toThrow(NotFoundError);
    });

    it('should delete a user', async () => {
        const deleted = await deleteUser(createdUser.id);
        expect(deleted).toBe(true);
        await expect(findUserById(createdUser.id)).resolves.toBeNull();
    });

    it('should return all users', async () => {
        const users = await getAllUsers();
        expect(users).toEqual(expect.arrayContaining([createdUser]));
    });

    it('should throw error when deleting non-existent user', async () => {
        await expect(deleteUser('non-existent-id')).rejects.toThrow(NotFoundError);
    });
});