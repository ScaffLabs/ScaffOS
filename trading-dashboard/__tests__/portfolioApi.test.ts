import { fetchPositions, createPosition, updatePosition, deletePosition } from '../src/api/portfolioApi';
import { ServiceError, ValidationError, NotFoundError } from '../src/utils/errors';
import axios from 'axios';
import { InMemoryStore } from '../src/storage/InMemoryStore';
import { Position } from '../src/types';

jest.mock('axios');

describe('portfolioApi', () => {
    let store: InMemoryStore<Position>;

    beforeEach(() => {
        store = new InMemoryStore<Position>();
        store.create({ id: '1', symbol: 'AAPL', quantity: 100 });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('fetchPositions should return positions', async () => {
        (axios.get as jest.Mock).mockResolvedValue({ data: [{ id: '1', symbol: 'AAPL', quantity: 100 }] });
        const positions = await fetchPositions(10, 0, 'id', 'asc');
        expect(positions).toEqual([{ id: '1', symbol: 'AAPL', quantity: 100 }]);
    });

    it('createPosition should create a new position', async () => {
        const newPosition = { id: '2', symbol: 'GOOGL', quantity: 5 };
        (axios.post as jest.Mock).mockResolvedValue({});
        await createPosition(newPosition);
        expect(axios.post).toHaveBeenCalledWith(expect.any(String), newPosition);
    });

    it('updatePosition should update an existing position', async () => {
        (axios.put as jest.Mock).mockResolvedValue({});
        await updatePosition('1', 150);
        expect(axios.put).toHaveBeenCalledWith(expect.any(String), { quantity: 150 });
    });

    it('deletePosition should delete an existing position', async () => {
        (axios.delete as jest.Mock).mockResolvedValue({});
        await deletePosition('1');
        expect(axios.delete).toHaveBeenCalledWith(expect.any(String));
    });

    it('should throw ValidationError for invalid position data', async () => {
        await expect(createPosition({ id: '3', symbol: 'MSFT', quantity: -5 })).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError for non-existing position', async () => {
        (axios.delete as jest.Mock).mockRejectedValue(new Error('Network Error'));
        await expect(deletePosition('2')).rejects.toThrow(NotFoundError);
    });
});
