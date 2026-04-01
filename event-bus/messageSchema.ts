export interface Message<T> {
    topic: string;
    data: T;
    timestamp: number;
}

export interface UserCreated {
    userId: string;
    username: string;
}

export type EventMessages = UserCreated;