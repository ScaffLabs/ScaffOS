export interface User {
    id: string;
    username: string;
    email: string;
}

const users: User[] = [];

export const createUser = (username: string, email: string): User => {
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
