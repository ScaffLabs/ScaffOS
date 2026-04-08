import { fetchPositions, createPosition, updatePosition, deletePosition } from '../src/api/portfolioApi';
import axios from 'axios';
import { ServiceError, ValidationError } from '../src/utils/errors';
import { InMemoryStore } from '../src/storage/InMemoryStore';
import { Position } from '../src/types';

jest.mock('axios');

describe('portfolioApi', () => {
    let store: InMemoryStore<Position>;

    beforeEach(() => {
        store = new InMemoryStore<Position>();
        store.create({ id: '1', symbol: 'AAPL', quantity: 10 });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('fetchPositions should return positions with pagination', async () => {
        (axios.get as jest.Mock).mockResolvedValue({ data: [{ id: 1, symbol: 'AAPL', quantity: 10 }] });
        const result = await fetchPositions(10, 0, 'id', 'asc');
        expect(result).toEqual([{ id: 1, symbol: 'AAPL', quantity: 10 }]);
    });

    it('createPosition should successfully create a position', async () => {
        const newPosition = { id: '2', symbol: 'GOOGL', quantity: 5 };
        (axios.post as jest.Mock).mockResolvedValue({});
        await createPosition(newPosition);
        expect(axios.post).toHaveBeenCalledWith(expect.any(String), newPosition);
    });

    it('updatePosition should throw error on invalid quantity', async () => {
        await expect(updatePosition('1', -5)).rejects.toThrow(ValidationError);
    });

    it('deletePosition should delete position', async () => {
        (axios.delete as jest.Mock).mockResolvedValue({});
        await deletePosition('1');
        expect(axios.delete).toHaveBeenCalledWith(expect.any(String));
    });

    it('deletePosition should throw error on delete failure', async () => {
        (axios.delete as jest.Mock).mockRejectedValue(new Error('Network Error'));
        await expect(deletePosition('1')).rejects.toThrow(ServiceError);
    });
});