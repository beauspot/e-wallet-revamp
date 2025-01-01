import supertest from 'supertest';

// Assuming createApp is the function that returns your Express app 
import createApp  from '@/app';

// Create an app instance for testing
const app = createApp();

describe('index route', () => {
    test('should return the contents of the index endpoint', async () => {
        // Make a GET request to the root endpoint
        const res = await supertest(app).get('/');

        // Check that the status code is 200 (OK)
        expect(res.status).toBe(200);

        // Verify that the body content matches the expected HTML
        expect(res.text).toBe('<h1>E-Wallet API Documentation</h1><a href="/api-docs">Documentation</a>');
    });
});
