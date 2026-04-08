import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Chart from '../src/components/Chart';
import { fetchChartData } from '../src/api/chartApi';

jest.mock('../src/api/chartApi');

describe('Chart Component', () => {
    it('renders chart data', async () => {
        (fetchChartData as jest.Mock).mockResolvedValue([{ date: '2021-01-01', price: 100 }, { date: '2021-01-02', price: 110 }]);
        render(<Chart />);
        await waitFor(() => expect(screen.getByText('Price')).toBeInTheDocument());
    });

    it('displays an error message on failure', async () => {
        (fetchChartData as jest.Mock).mockRejectedValue(new Error('Failed to load chart data'));
        render(<Chart />);
        await waitFor(() => expect(screen.getByText('Failed to load chart data.')).toBeInTheDocument());
    });
});
