import { fetchPositions, createPosition, updatePosition, deletePosition } from '../src/api/portfolioApi';
import axios from 'axios';
import { ServiceError, ValidationError } from '../src/utils/errors';

jest.mock('axios');

describe('portfolioApi', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('fetchPositions should return positions with pagination', async () => {
        (axios.get as jest.Mock).mockResolvedValue({ data: [{ id: 1, symbol: 'AAPL', quantity: 10 }] });
        const result = await fetchPositions(10, 0, 'id', 'asc');
        expect(result).toEqual([{ id: 1, symbol: 'AAPL', quantity: 10 }]);
    });

    it('fetchPositions should throw error on invalid data structure', async () => {
        (axios.get as jest.Mock).mockResolvedValue({ data: { invalid: true } });
        await expect(fetchPositions(10, 0, 'id', 'asc')).rejects.toThrow(ServiceError);
    });

    it('createPosition should successfully create a position', async () => {
        (axios.post as jest.Mock).mockResolvedValue({});
        const position = { id: '1', symbol: 'AAPL', quantity: 10 };
        await createPosition(position);
        expect(axios.post).toHaveBeenCalledWith(expect.any(String), position);
    });

    it('createPosition should throw error on invalid position data', async () => {
        const invalidPosition = { id: '1', symbol: '', quantity: -10 };
        await expect(createPosition(invalidPosition)).rejects.toThrow(ValidationError);
    });

    it('updatePosition should successfully update position', async () => {
        (axios.put as jest.Mock).mockResolvedValue({});
        await updatePosition('1', 5);
        expect(axios.put).toHaveBeenCalledWith(expect.any(String), { quantity: 5 }, expect.any(Object));
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
