import { InMemoryStore } from '../src/storage/InMemoryStore';
import { Position } from '../src/types';

describe('InMemoryStore', () => {
    let store: InMemoryStore<Position>;

    beforeEach(() => {
        store = new InMemoryStore<Position>();
    });

    test('should create and read a position', () => {
        const position: Position = { id: '1', symbol: 'AAPL', quantity: 100 };
        store.create(position);
        expect(store.read('1')).toEqual(position);
    });

    test('should update a position', () => {
        const position: Position = { id: '1', symbol: 'AAPL', quantity: 100 };
        store.create(position);
        store.update('1', { quantity: 150 });
        expect(store.read('1')?.quantity).toEqual(150);
    });

    test('should delete a position', () => {
        const position: Position = { id: '1', symbol: 'AAPL', quantity: 100 };
        store.create(position);
        store.delete('1');
        expect(store.read('1')).toBeUndefined();
    });

    test('should find by index', () => {
        const position1: Position = { id: '1', symbol: 'AAPL', quantity: 100 };
        const position2: Position = { id: '2', symbol: 'AAPL', quantity: 200 };
        store.create(position1);
        store.create(position2);
        const results = store.findByIndex('symbol', 'AAPL');
        expect(results).toEqual([position1, position2]);
    });

    test('should support transactions', () => {
        store.beginTransaction();
        const position: Position = { id: '1', symbol: 'AAPL', quantity: 100 };
        store.create(position);
        store.rollback();
        expect(store.read('1')).toBeUndefined();

        store.beginTransaction();
        store.create(position);
        store.commit();
        expect(store.read('1')).toEqual(position);
    });
});
