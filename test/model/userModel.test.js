// test/model/userModel.test.js

const userModel = require('../../model/userModel');
const dbConnect = require('../../database/index');
const bcrypt = require('bcrypt');

jest.mock('../../database/index');

describe('User Model - loginUser', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return null if email does not exist', async () => {
        dbConnect.query.mockResolvedValue([null]);

        const requestData = {
            email: 'nonexistent@example.com',
            password: 'password123',
            sessionId: 'sessionId123'
        };

        const result = await userModel.loginUser(requestData);
        expect(result).toBeNull();
    });
});
