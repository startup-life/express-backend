// const dbConnect = require('../database/index.js');
const { STATUS_CODE, STATUS_MESSAGE } = require('./constant/httpStatusCode');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET;

const isLoggedIn = (request, response, next) => {
    const authHeader = request.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        const error = new Error(STATUS_MESSAGE.REQUIRED_AUTHORIZATION);
        error.status = STATUS_CODE.UNAUTHORIZED;
        return next(error);
    }
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            const error = new Error(STATUS_MESSAGE.REQUIRED_AUTHORIZATION);
            error.status = STATUS_CODE.UNAUTHORIZED;
            return next(error);
        }
        // 토큰이 유효하면 사용자 정보를 request 객체에 저장하여 다음 미들웨어/라우트에서 사용 가능
        request.userId = user.userId;
        next();
    });
};

/*const isLoggedIn = async (req, res, next) => {
    const { session } = req.headers;
    const userId =
        req.headers.userid && !Number.isNaN(req.headers.userid)
            ? parseInt(req.headers.userid, 10)
            : null;

    try {
        if (!userId) {
            const error = new Error(STATUS_MESSAGE.REQUIRED_AUTHORIZATION);
            error.status = STATUS_CODE.UNAUTHORIZED;
            return next(error);
        }

        const userSessionData = await dbConnect.query(
            `SELECT session_id FROM user_table WHERE user_id = ?;`,
            [userId],
            res
        );

        if (
            !userSessionData ||
            userSessionData.length === 0 ||
            session !== userSessionData[0].session_id
        ) {
            const error = new Error(STATUS_MESSAGE.REQUIRED_AUTHORIZATION);
            error.status = STATUS_CODE.UNAUTHORIZED;
            return next(error);
        }

        return next();
    } catch (error) {
        return next(error);
    }
};*/

module.exports = isLoggedIn;
