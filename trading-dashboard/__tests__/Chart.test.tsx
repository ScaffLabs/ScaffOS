import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Chart from '../src/components/Chart';
import { fetchChartData } from '../src/api/chartApi';

jest.mock('../src/api/chartApi');

describe('Chart Component', () => {
    it('renders chart data correctly', async () => {
        (fetchChartData as jest.Mock).mockResolvedValue([{ date: '2021-01-01', price: 100 }, { date: '2021-01-02', price: 110 }]);
        render(<Chart />);
        await waitFor(() => expect(screen.getByText('Price')).toBeInTheDocument());
        expect(screen.getByText('2021-01-01')).toBeInTheDocument();
        expect(screen.getByText('2021-01-02')).toBeInTheDocument();
    });

    it('displays an error message on failure', async () => {
        (fetchChartData as jest.Mock).mockRejectedValue(new Error('Failed to load chart data'));
        render(<Chart />);
        await waitFor(() => expect(screen.getByText('Failed to load chart data.')).toBeInTheDocument());
    });

    it('handles empty chart data gracefully', async () => {
        (fetchChartData as jest.Mock).mockResolvedValue([]);
        render(<Chart />);
        await waitFor(() => expect(screen.queryByText('Price')).not.toBeInTheDocument());
    });

    it('handles invalid data structure gracefully', async () => {
        (fetchChartData as jest.Mock).mockResolvedValue({ invalid: true });
        render(<Chart />);
        await waitFor(() => expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument());
    });
});
