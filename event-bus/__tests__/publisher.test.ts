import { publish } from '../publisher';
import redisClient from '../redisClient';
import { Message } from '../messageSchema';

jest.mock('../redisClient');

describe('Publisher Tests', () => {
    const message: Message<{ userId: string; username: string }> = {
        topic: 'userCreated',
        data: { userId: '1', username: 'testuser' },
        timestamp: Date.now(),
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should publish a message successfully', async () => {
        (redisClient.publish as jest.Mock).mockResolvedValueOnce(1);
        await publish(message);
        expect(redisClient.publish).toHaveBeenCalledWith(message.topic, JSON.stringify(message.data));
    });

    it('should throw an error if topic is invalid', async () => {
        const invalidMessage = { ...message, topic: '' };
        await expect(publish(invalidMessage)).rejects.toThrow('Invalid topic');
    });

    it('should throw an error if data is missing', async () => {
        const invalidMessage = { ...message, data: null };
        await expect(publish(invalidMessage)).rejects.toThrow('Invalid data');
    });

    it('should retry publishing on failure', async () => {
        (redisClient.publish as jest.Mock).mockRejectedValueOnce(new Error('Redis error'));
        (redisClient.publish as jest.Mock).mockResolvedValueOnce(1);
        await publish(message);
        expect(redisClient.publish).toHaveBeenCalledTimes(2);
    });
});
