import EventBus from '../eventBus';

const eventBus = new EventBus();

describe('EventBus', () => {
    const testTopic = 'testTopic';
    const testData = { message: 'Hello, World!' };
    const mockListener = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should subscribe to a topic', () => {
        eventBus.subscribe(testTopic, mockListener);
        eventBus.publish(testTopic, testData);
        expect(mockListener).toHaveBeenCalledWith(expect.objectContaining({ topic: testTopic, data: testData }));
    });

    test('should publish a message to the topic', () => {
        eventBus.subscribe(testTopic, mockListener);
        eventBus.publish(testTopic, testData);
        expect(mockListener).toHaveBeenCalledTimes(1);
    });

    test('should unsubscribe from a topic', () => {
        eventBus.subscribe(testTopic, mockListener);
        eventBus.unsubscribe(testTopic, mockListener);
        eventBus.publish(testTopic, testData);
        expect(mockListener).not.toHaveBeenCalled();
    });

    test('should clear subscriptions for a topic', () => {
        eventBus.subscribe(testTopic, mockListener);
        eventBus.clearSubscriptions(testTopic);
        eventBus.publish(testTopic, testData);
        expect(mockListener).not.toHaveBeenCalled();
    });

    test('should handle multiple subscriptions to the same topic', () => {
        const secondListener = jest.fn();
        eventBus.subscribe(testTopic, mockListener);
        eventBus.subscribe(testTopic, secondListener);
        eventBus.publish(testTopic, testData);
        expect(mockListener).toHaveBeenCalled();
        expect(secondListener).toHaveBeenCalled();
    });

    test('should not call listener if no subscriptions exist for the topic', () => {
        eventBus.publish(testTopic, testData);
        expect(mockListener).not.toHaveBeenCalled();
    });

    test('should handle error when publishing to a topic with no listeners', () => {
        expect(() => eventBus.publish(testTopic, testData)).not.toThrow();
    });

    test('should maintain separate subscriptions for different topics', () => {
        const anotherTopic = 'anotherTopic';
        const anotherListener = jest.fn();
        eventBus.subscribe(anotherTopic, anotherListener);
        eventBus.publish(testTopic, testData);
        expect(anotherListener).not.toHaveBeenCalled();
    });
});