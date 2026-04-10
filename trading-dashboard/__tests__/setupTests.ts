import '@testing-library/jest-dom/extend-expect';
import { jest } from '@jest/globals';
import axios from 'axios';

jest.mock('axios'); // Mocking axios globally for tests.

jest.mock('../src/api/portfolioApi', () => ({
    fetchPositions: jest.fn(),
    createPosition: jest.fn(),
    updatePosition: jest.fn(),
    deletePosition: jest.fn(),
}));
