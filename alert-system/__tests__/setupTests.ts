import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

jest.setTimeout(30000);  // Set a longer timeout for async tests

// Mock environment variables if needed
process.env.WEBHOOK_URL = 'http://mock-webhook-url';
process.env.EMAIL_SERVICE_URL = 'http://mock-email-service-url';
process.env.MONGO_URI = 'mongodb://localhost:27017/alert-system-test';
