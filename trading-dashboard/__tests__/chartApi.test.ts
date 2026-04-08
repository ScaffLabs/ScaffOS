import { fetchChartData, validateChartData, addChartData, deleteChartData } from '../src/api/chartApi';
import { ServiceError } from '../src/utils/errors';
import axios from 'axios';

jest.mock('axios');

describe('chartApi', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('fetchChartData should return valid chart data', async () => {
        const mockData = [{ date: '2021-01-01', price: 100 }];
        (axios.get as jest.Mock).mockResolvedValue({ data: mockData });
        const data = await fetchChartData();
        expect(data).toEqual(mockData);
    });

    it('fetchChartData should throw ServiceError on invalid data structure', async () => {
        (axios.get as jest.Mock).mockResolvedValue({ data: {} });
        await expect(fetchChartData()).rejects.toThrow(ServiceError);
    });

    it('validateChartData should throw ServiceError for invalid data', () => {
        expect(() => validateChartData([])).toThrow(ServiceError);
        expect(() => validateChartData([{ invalid: true }])).toThrow(ServiceError);
    });

    it('addChartData should add valid chart data', async () => {
        (axios.post as jest.Mock).mockResolvedValue({});
        await addChartData('2021-01-01', 100);
        expect(axios.post).toHaveBeenCalledWith(expect.any(String), { date: '2021-01-01', price: 100 });
    });

    it('addChartData should throw ServiceError for invalid inputs', async () => {
        await expect(addChartData('', 100)).rejects.toThrow(ServiceError);
        await expect(addChartData('2021-01-01', -100)).rejects.toThrow(ServiceError);
    });

    it('deleteChartData should delete valid chart data', async () => {
        (axios.delete as jest.Mock).mockResolvedValue({});
        await deleteChartData('2021-01-01');
        expect(axios.delete).toHaveBeenCalledWith(expect.any(String));
    });

    it('deleteChartData should throw ServiceError for invalid date', async () => {
        await expect(deleteChartData(123)).rejects.toThrow(ServiceError);
    });
});
