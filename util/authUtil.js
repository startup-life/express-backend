const { STATUS_CODE, STATUS_MESSAGE } = require('./constant/httpStatusCode');
const jwt = require('jsonwebtoken');
const redis = require('../database/redis.js');
const redisClient = redis.v4;

const SECRET_KEY = process.env.JWT_SECRET;

const isLoggedIn = async (request, response, next) => {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
        const error = new Error(STATUS_MESSAGE.REQUIRED_AUTHORIZATION);
        error.status = STATUS_CODE.UNAUTHORIZED;
        return next(error);
    }

    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        const error = new Error(STATUS_MESSAGE.REQUIRED_AUTHORIZATION);
        error.status = STATUS_CODE.UNAUTHORIZED;
        return next(error);
    }

    try {
        // 1. JWT 검증
        const decoded = jwt.verify(token, SECRET_KEY);
        if (!decoded) {
            const error = new Error(STATUS_MESSAGE.REQUIRED_AUTHORIZATION);
            error.status = STATUS_CODE.UNAUTHORIZED;
            return next(error);
        }
        request.user = decoded;

        // 2. redis 검증
        const redisKey = `accessToken:${token}`; // Redis에 저장된 키 형식과 맞춤
        const storedToken = await redisClient.get(redisKey); // 정확한 키로 조회
        if (!storedToken) {
            const error = new Error(STATUS_MESSAGE.REQUIRED_AUTHORIZATION);
            error.status = STATUS_CODE.UNAUTHORIZED;
            return next(error);
        }

        next();
    } catch (error) {
        return next(error);
    }
};

module.exports = isLoggedIn;
