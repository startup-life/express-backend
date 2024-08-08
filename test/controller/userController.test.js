// test/controller/userController.test.js

const request = require('supertest');
const app = require('../../app');

jest.mock('../../database/index');
jest.mock('../../model/userModel');

describe('User Controller - loginUser', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if email is not provided', async () => {
        const res = await request(app)
            .post('/users/login')
            .send({ password: 'password123' });

        expect(res.statusCode).toBe(400);
        expect(res.body.error.message).toBe('required_email');
    });
});
