// test/controller/userController.test.js

const request = require('supertest');
const { app, startHttpServer } = require('../../app');

let server;

beforeAll((done) => {
    process.env.NODE_ENV = 'test'; // 테스트 환경 설정
    server = startHttpServer(0); // 포트를 0으로 설정하여 사용 가능한 포트를 자동으로 할당받음
    server.on('listening', () => {
        const address = server.address();
        console.log(`Test server listening on port ${address.port}`);
        done();
    });
});

afterAll((done) => {
    if (server) {
        server.close(done);
    } else {
        done();
    }
});

jest.mock('../../database/index');
jest.mock('../../model/userModel');

describe('User Controller - loginUser', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if email is not provided', async () => {
        const address = server.address();
        const res = await request(`http://localhost:${address.port}`) // 동적으로 할당된 포트 사용
            .post('/users/login')
            .send({ password: 'password123' });

        expect(res.statusCode).toBe(400);
        expect(res.body.error.message).toBe('required_email');
    });
});
