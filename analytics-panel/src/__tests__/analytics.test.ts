import { fetchPerformanceMetrics, fetchComparisonData } from '../api/analytics';

jest.mock('../api/analytics');

describe('Analytics API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('fetchPerformanceMetrics returns data', async () => {
        const mockData = { drawdown: [10, 20, 30] };
        (fetch as jest.Mock).mockResolvedValueOnce({ json: jest.fn().mockResolvedValueOnce(mockData) });

        const data = await fetchPerformanceMetrics();
        expect(data).toEqual(mockData);
    });

    test('fetchPerformanceMetrics handles errors', async () => {
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        await expect(fetchPerformanceMetrics()).rejects.toThrow('Network error');
    });

    test('fetchComparisonData returns comparison result', async () => {
        const mockResult = { betterStrategy: 'A' };
        (fetch as jest.Mock).mockResolvedValueOnce({ json: jest.fn().mockResolvedValueOnce(mockResult) });

        const result = await fetchComparisonData('strategyA', 'strategyB');
        expect(result).toEqual(mockResult);
    });

    test('fetchComparisonData handles errors', async () => {
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        await expect(fetchComparisonData('strategyA', 'strategyB')).rejects.toThrow('Network error');
    });
});