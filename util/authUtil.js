import * as dbConnect from '../database/index.js';
import { STATUS_CODES, MESSAGES } from '../util/responseConstants.js';

const isLoggedIn = async (request, response, next) => {
    const { method, url } = request;
    console.log(`[isLoggedIn] method: ${method}, url: ${url}`);

    const { session } = request.headers;
    const userId =
        request.headers.userid && !Number.isNaN(request.headers.userid)
            ? parseInt(request.headers.userid, 10)
            : null;

    if (!userId) {
        return response.status(401).json({
            status: 401,
            message: 'required_authorization check',
            data: null,
        });
    }

    try {
        const userSessionData = await dbConnect.query(
            `SELECT session_id FROM user_table WHERE user_id = ${userId};`,
            response,
        );

        console.log(
            `[isLoggedIn] userSessionData: ${JSON.stringify(userSessionData)}`,
        );

        if (
            !userSessionData ||
            userSessionData.length === 0 ||
            session !== userSessionData[0].session_id
        ) {
            return response.status(STATUS_CODES.NOT_AUTHORIZED).json({
                status: STATUS_CODES.NOT_AUTHORIZED,
                message: MESSAGES.NOT_AUTHORIZED,
                data: null,
            });
        }

        return next();
    } catch (error) {
        console.error(error);
        return response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
            message: MESSAGES.INTERNAL_SERVER_ERROR,
            data: null,
        });
    }
};

export default isLoggedIn;
