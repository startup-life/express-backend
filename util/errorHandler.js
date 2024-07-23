const { STATUS_CODE, STATUS_MESSAGE } = require('./constant/httpStatusCode');
const notFoundHandler = (request, response, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
};

const errorHandler = (error, request, response, next) => {
    if (request.timedout) {
        response.status(STATUS_CODE.SERVER_TIMEOUT);
        return response.send({
            error: {
                status: STATUS_CODE.SERVER_TIMEOUT,
                message: STATUS_MESSAGE.REQUEST_TIMEOUT,
                data: null
            }
        });
    }

    response.status(error.status || STATUS_CODE.INTERNAL_SERVER_ERROR);
    return response.send({
        error: {
            status: error.status || STATUS_CODE.INTERNAL_SERVER_ERROR,
            message: error.message || STATUS_MESSAGE.INTERNAL_SERVER_ERROR,
            data: null
        }
    });
};

module.exports = { notFoundHandler, errorHandler };
