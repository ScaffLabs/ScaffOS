import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../src/components/Dashboard';

describe('Dashboard Component', () => {
    test('renders Admin Dashboard heading', () => {
        render(<Dashboard />);
        const headingElement = screen.getByText(/Admin Dashboard/i);
        expect(headingElement).toBeInTheDocument();
    });

    test('renders overview message', () => {
        render(<Dashboard />);
        const messageElement = screen.getByText(/Overview of system health and metrics./i);
        expect(messageElement).toBeInTheDocument();
    });
});