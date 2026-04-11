import EventBus from '../eventBus';
import { Message } from '../messageSchema';

const eventBus = new EventBus();

describe('EventBus', () => {
    const testTopic = 'testTopic';
    const testData: Message<any> = { topic: testTopic, data: { message: 'Hello, World!' }, timestamp: Date.now() };
    const mockListener = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should subscribe to a topic', () => {
        eventBus.subscribe(testTopic, mockListener);
        eventBus.publish(testData.topic, testData.data);
        expect(mockListener).toHaveBeenCalledWith(expect.objectContaining({ topic: testTopic, data: testData.data }));
    });

    test('should publish a message to the topic', () => {
        eventBus.subscribe(testTopic, mockListener);
        eventBus.publish(testData.topic, testData.data);
        expect(mockListener).toHaveBeenCalledTimes(1);
    });

    test('should unsubscribe from a topic', () => {
        eventBus.subscribe(testTopic, mockListener);
        eventBus.unsubscribe(testTopic, mockListener);
        eventBus.publish(testData.topic, testData.data);
        expect(mockListener).not.toHaveBeenCalled();
    });

    test('should clear subscriptions for a topic', () => {
        eventBus.subscribe(testTopic, mockListener);
        eventBus.clearSubscriptions(testTopic);
        eventBus.publish(testData.topic, testData.data);
        expect(mockListener).not.toHaveBeenCalled();
    });

    test('should handle multiple subscriptions to the same topic', () => {
        const secondListener = jest.fn();
        eventBus.subscribe(testTopic, mockListener);
        eventBus.subscribe(testTopic, secondListener);
        eventBus.publish(testData.topic, testData.data);
        expect(mockListener).toHaveBeenCalled();
        expect(secondListener).toHaveBeenCalled();
    });

    test('should not call listener if no subscriptions exist for the topic', () => {
        eventBus.publish(testData.topic, testData.data);
        expect(mockListener).not.toHaveBeenCalled();
    });

    test('should throw error when publishing invalid message', async () => {
        await expect(eventBus.publish(testTopic, null)).rejects.toThrow();
    });
});
