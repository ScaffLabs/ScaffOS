import 'jest';
import { jest } from '@jest/globals';

jest.setTimeout(30000); // Set a global timeout for tests
jest.mock('axios'); // Mock axios globally for tests
