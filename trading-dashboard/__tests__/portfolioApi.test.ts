import { fetchPositions, updatePosition, deletePosition } from '../src/api/portfolioApi';
import axios from 'axios';

jest.mock('axios');

describe('portfolioApi', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('fetchPositions should fetch positions', async () => {
        (axios.get as jest.Mock).mockResolvedValue({ data: [{ id: 1, symbol: 'AAPL', quantity: 10 }] });
        const result = await fetchPositions();
        expect(result).toEqual([{ id: 1, symbol: 'AAPL', quantity: 10 }]);
        expect(axios.get).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
    });

    it('fetchPositions should throw error on failure', async () => {
        (axios.get as jest.Mock).mockRejectedValue(new Error('Network Error'));
        await expect(fetchPositions()).rejects.toThrow('Error fetching positions');
    });

    it('updatePosition should update position', async () => {
        (axios.put as jest.Mock).mockResolvedValue({});
        await updatePosition('1', 5);
        expect(axios.put).toHaveBeenCalledWith(expect.any(String), { quantity: 5 }, expect.any(Object));
    });

    it('updatePosition should throw error on failure', async () => {
        (axios.put as jest.Mock).mockRejectedValue(new Error('Network Error'));
        await expect(updatePosition('1', 5)).rejects.toThrow('Error updating position');
    });

    it('deletePosition should delete position', async () => {
        (axios.delete as jest.Mock).mockResolvedValue({});
        await deletePosition('1');
        expect(axios.delete).toHaveBeenCalledWith(expect.any(String));
    });

    it('deletePosition should throw error on failure', async () => {
        (axios.delete as jest.Mock).mockRejectedValue(new Error('Network Error'));
        await expect(deletePosition('1')).rejects.toThrow('Error deleting position');
    });
});
