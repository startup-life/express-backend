import request from 'supertest';
import app from '../app.js'; // Express 앱을 가져옴
import { STATUS_CODES, MESSAGES } from '../util/responseConstants.js'; // 필요한 상수들

describe('POST /users/signup', () => {
    it('should return 201', async () => {
        const response = await request(app).post('/users/signup').send({
            email: 'yaro@startupcode.kr',
            password: '12341234aS!',
            nickname: 'yaro',
        });

        expect(response.status).toBe(STATUS_CODES.CREATED);
        expect(response.body.message).toBe(MESSAGES.USER.SIGNUP_SUCCESS);
    });

    it('should return 400 if email is invalid', async () => {
        const response = await request(app).post('/users/signup').send({
            email: 'test@test.kr',
            password: 'ValidPassword123!',
            nickname: 'tester777',
        });

        expect(response.status).toBe(STATUS_CODES.BAD_REQUEST);
        expect(response.body.message).toBe(MESSAGES.USER.ALREADY_EXIST_EMAIL);
    });

    /*
    it('should return 400 if password is invalid', async () => {
        const response = await request(app).post('/users/signup').send({
            email: 'test@example.com',
            password: 'short',
            nickname: 'validNickname',
        });

        expect(response.status).toBe(STATUS_CODES.BAD_REQUEST);
        expect(response.body.message).toBe(MESSAGES.USER.INVALID_USER_PASSWORD);
    });

    it('should return 201 and sign up user successfully', async () => {
        const response = await request(app).post('/users/signup').send({
            email: 'test@example.com',
            password: 'ValidPassword123!',
            nickname: 'validNickname',
        });

        expect(response.status).toBe(STATUS_CODES.CREATED);
        expect(response.body.message).toBe(MESSAGES.USER.SIGNUP_SUCCESS);
        expect(response.body.data).toHaveProperty('userId');
        expect(response.body.data).toHaveProperty('profileImageId');
    });

    it('should return 500 if an internal server error occurs', async () => {
        jest.spyOn(userModel, 'signUpUser').mockImplementation(() => {
            throw new Error('Internal Server Error');
        });

        const response = await request(app).post('/users/signup').send({
            email: 'test@example.com',
            password: 'ValidPassword123!',
            nickname: 'validNickname',
        });

        expect(response.status).toBe(STATUS_CODES.INTERNAL_SERVER_ERROR);
        expect(response.body.message).toBe(MESSAGES.INTERNAL_SERVER_ERROR);

        userModel.signUpUser.mockRestore();
    }); */
});

describe.only('POST /users/login', () => {
    it('should return 200', async () => {
        const response = await request(app).post('/users/login').send({
            email: 'test@test.kr',
            password: '12341234aS!',
        });

        console.log(response.body); // 응답 데이터 출력

        expect(response.status).toBe(STATUS_CODES.OK);
        expect(response.body.message).toBe(MESSAGES.USER.LOGIN_SUCCESS);
    });
});
