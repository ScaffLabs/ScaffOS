import { server } from './src/index';

beforeAll(async () => {
    await server.start();
});

afterAll(async () => {
    await server.stop();
});
