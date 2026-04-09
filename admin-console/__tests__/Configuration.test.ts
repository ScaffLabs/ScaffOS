import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Configuration from '../src/components/Configuration';
import { postConfiguration, fetchConfigurations, deleteConfiguration } from '../src/services/ServiceClient';

jest.mock('../src/services/ServiceClient');

describe('Configuration Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders Configuration Management heading', () => {
        render(<Configuration />);
        const headingElement = screen.getByText(/Configuration Management/i);
        expect(headingElement).toBeInTheDocument();
    });

    test('renders manage system configurations message', () => {
        render(<Configuration />);
        const messageElement = screen.getByText(/Manage system configurations here./i);
        expect(messageElement).toBeInTheDocument();
    });

    test('submits form and shows success message', async () => {
        (postConfiguration as jest.Mock).mockResolvedValueOnce({});
        render(<Configuration />);

        fireEvent.change(screen.getByLabelText(/Key/i), { target: { value: 'testKey' } });
        fireEvent.change(screen.getByLabelText(/Value/i), { target: { value: 'testValue' } });
        fireEvent.click(screen.getByText(/Create Configuration/i));

        expect(await screen.findByText(/Configuration created successfully!/i)).toBeInTheDocument();
    });

    test('shows error message on failed submission', async () => {
        (postConfiguration as jest.Mock).mockRejectedValueOnce(new Error('Failed to create configuration'));
        render(<Configuration />);

        fireEvent.change(screen.getByLabelText(/Key/i), { target: { value: 'testKey' } });
        fireEvent.change(screen.getByLabelText(/Value/i), { target: { value: 'testValue' } });
        fireEvent.click(screen.getByText(/Create Configuration/i));

        expect(await screen.findByText(/Failed to create configuration. Please try again./i)).toBeInTheDocument();
    });

    test('handles empty input', async () => {
        render(<Configuration />);
        fireEvent.click(screen.getByText(/Create Configuration/i));
        expect(await screen.findByText(/Key cannot be empty/i)).toBeInTheDocument();
    });

    test('handles invalid input', async () => {
        render(<Configuration />);
        fireEvent.change(screen.getByLabelText(/Key/i), { target: { value: '' } });
        fireEvent.change(screen.getByLabelText(/Value/i), { target: { value: 'validValue' } });
        fireEvent.click(screen.getByText(/Create Configuration/i));

        expect(await screen.findByText(/Key cannot be empty/i)).toBeInTheDocument();
    });

    test('handles whitespace input', async () => {
        render(<Configuration />);
        fireEvent.change(screen.getByLabelText(/Key/i), { target: { value: '   ' } });
        fireEvent.change(screen.getByLabelText(/Value/i), { target: { value: 'validValue' } });
        fireEvent.click(screen.getByText(/Create Configuration/i));

        expect(await screen.findByText(/Key cannot be empty/i)).toBeInTheDocument();
    });

    test('deletes a configuration and shows success message', async () => {
        (fetchConfigurations as jest.Mock).mockResolvedValueOnce([{ key: 'testKey', value: 'testValue' }]);
        (deleteConfiguration as jest.Mock).mockResolvedValueOnce();
        render(<Configuration />);

        expect(await screen.findByText(/testKey: testValue/i)).toBeInTheDocument();
        fireEvent.click(screen.getByText(/Delete/i));

        expect(await screen.findByText(/Configuration deleted successfully!/i)).toBeInTheDocument();
    });

    test('handles delete failure', async () => {
        (fetchConfigurations as jest.Mock).mockResolvedValueOnce([{ key: 'testKey', value: 'testValue' }]);
        (deleteConfiguration as jest.Mock).mockRejectedValueOnce(new Error('Failed to delete configuration'));
        render(<Configuration />);

        expect(await screen.findByText(/testKey: testValue/i)).toBeInTheDocument();
        fireEvent.click(screen.getByText(/Delete/i));

        expect(await screen.findByText(/Failed to delete configuration. Please try again./i)).toBeInTheDocument();
    });
});