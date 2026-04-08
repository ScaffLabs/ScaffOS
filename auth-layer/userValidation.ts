import { z } from 'zod';
import { User } from './types';

const userSchema = z.object({
    username: z.string().min(1, { message: 'Username is required' }),
    email: z.string().email({ message: 'Invalid email format' }),
});

export const validateUser = (user: Partial<User>) => {
    return userSchema.parse(user);
};

export default validateUser;