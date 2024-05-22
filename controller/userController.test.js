import request from 'supertest';
import bcrypt from 'bcrypt';
import mysql from 'mysql2';
import app from '../app.js'; // Express 앱을 가져옴
import { STATUS_CODES, MESSAGES } from '../util/responseConstants.js'; // 필요한 상수들
import * as userModel from '../model/userModel.js'; // userModel 모듈을 가져옴

describe('POST /users/signup', () => {
    it('should return 400 if email is invalid', async () => {
        const response = await request(app).post('/users/signup').send({
            email: 'invalid-email',
            password: 'ValidPassword123!',
            nickname: 'validNickname',
        });

        expect(response.status).toBe(STATUS_CODES.BAD_REQUEST);
        expect(response.body.message).toBe(MESSAGES.USER.INVALID_USER_EMAIL);
    });

    it('should return 400 if nickname is invalid', async () => {
        const response = await request(app).post('/users/signup').send({
            email: 'test@example.com',
            password: 'ValidPassword123!',
            nickname: 'in;;;;;',
        });

        expect(response.status).toBe(STATUS_CODES.BAD_REQUEST);
        expect(response.body.message).toBe(MESSAGES.USER.INVALID_USER_NICKNAME);
    });

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
    });
});
