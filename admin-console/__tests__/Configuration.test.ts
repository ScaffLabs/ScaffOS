import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Configuration from '../src/components/Configuration';
import { postConfiguration } from '../src/services/ServiceClient';

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
});
