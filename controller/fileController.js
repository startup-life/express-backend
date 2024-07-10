const {
    STATUS_CODE,
    STATUS_MESSAGE,
} = require('../util/constant/httpStatusCode');

exports.uploadFile = (request, response, next) => {
    if (!request.file) {
        const error = new Error(STATUS_MESSAGE.INVALID_FILE);
        error.status = STATUS_CODE.BAD_REQUEST;
        throw error;
    }

    try {
        response.status(STATUS_CODE.CREATED).send({
            status: STATUS_CODE.CREATED,
            message: STATUS_MESSAGE.FILE_UPLOAD_SUCCESS,
            data: {
                //filePath: `image/profile/${request.file.filename}`,
                filePath: request.file.location, // S3 객체 URL 반환
            },
        });
    } catch (error) {
        return next(error);
    }
};

exports.uploadPostFile = (request, response, next) => {
    if (!request.file) {
        const error = new Error(STATUS_MESSAGE.INVALID_FILE);
        error.status = STATUS_CODE.BAD_REQUEST;
        throw error;
    }

    try {
        response.status(STATUS_CODE.CREATED).send({
            status: STATUS_CODE.CREATED,
            message: STATUS_MESSAGE.FILE_UPLOAD_SUCCESS,
            data: {
                // filePath: `image/post/${request.file.filename}`,
                filePath: request.file.location, // S3 객체 URL 반환
            },
        });
    } catch (error) {
        return next(error);
    }
};
