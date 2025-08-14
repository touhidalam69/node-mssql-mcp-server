// IMPORTANT: To run these tests, you must first install supertest
// npm install --save-dev supertest

const request = require('supertest');
const { app } = require('./index');
const { getPool } = require('../db/connection');

// Mock the modules that the server depends on
jest.mock('../db/connection');
jest.mock('../config', () => ({
  // Provide a mock config so the server can load without a real .env file
  dbConfigs: {
    maindb: { user: 'test', password: 'test', server: 'test', database: 'test', options: {} },
    reportingdb: { user: 'test', password: 'test', server: 'test', database: 'test', options: {} }
  }
}));

describe('GET /health', () => {

  beforeEach(() => {
    // Clear mock history before each test to ensure clean assertions
    jest.clearAllMocks();
  });

  it('should return 200 OK and a status of "ok" when all database connections are healthy', async () => {
    // Arrange: Mock getPool to simulate successful connections for all DBs
    getPool.mockResolvedValue({ connected: true });

    // Act: Make the HTTP request to the /health endpoint
    const response = await request(app).get('/health');

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.databases).toEqual({
      maindb: 'connected',
      reportingdb: 'connected'
    });
    // Verify that the connection was attempted for each configured database
    expect(getPool).toHaveBeenCalledTimes(2);
  });

  it('should return 503 Service Unavailable if any database connection fails', async () => {
    // Arrange: Mock getPool to fail for the second database
    getPool
      .mockResolvedValueOnce({ connected: true }) // First call succeeds
      .mockRejectedValueOnce(new Error('Connection error')); // Second call fails

    // Act: Make the HTTP request
    const response = await request(app).get('/health');

    // Assert
    expect(response.statusCode).toBe(503);
    expect(response.body.status).toBe('error');
    expect(response.body.databases).toEqual({
      maindb: 'connected',
      reportingdb: 'error'
    });
    expect(getPool).toHaveBeenCalledTimes(2);
  });
});

// TODO: Add test suites for other endpoints like /resources, /tools, etc.
