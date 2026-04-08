import axios from 'axios';

const httpClient = axios.create({
    baseURL: process.env.BASE_URL,
    timeout: 5000,
});

const retry = async (fn: Function, retries: number = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (err) {
            if (i === retries - 1) throw err;
        }
    }
};

export const fetchData = async (url: string) => {
    return retry(() => httpClient.get(url));
};

export const postData = async (url: string, data: any) => {
    return retry(() => httpClient.post(url, data));
};