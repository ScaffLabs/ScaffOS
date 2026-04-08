import React from 'react';
import { render, screen } from '@testing-library/react';
import Configuration from '../src/components/Configuration';

describe('Configuration Component', () => {
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
});