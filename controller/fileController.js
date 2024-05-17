import { STATUS_CODES, MESSAGES } from '../util/responseConstants.js';

export const uploadFile = (request, response) => {
    if (!request.file)
        response.status(STATUS_CODES.BAD_REQUEST).send({
            status: STATUS_CODES.BAD_REQUEST,
            message: MESSAGES.FILE.INVALID_FILE,
            data: null,
        });

    response.status(STATUS_CODES.CREATED).send({
        status: STATUS_CODES.CREATED,
        message: MESSAGES.FILE.FILE_UPLOAD_SUCCESS,
        data: {
            filePath: `/public/image/profile/${request.file.filename}`,
        },
    });
};

export const uploadPostFile = (request, response) => {
    if (!request.file)
        response.status(STATUS_CODES.BAD_REQUEST).send({
            status: STATUS_CODES.BAD_REQUEST,
            message: MESSAGES.FILE.INVALID_FILE,
            data: null,
        });

    response.status(STATUS_CODES.CREATED).send({
        status: STATUS_CODES.CREATED,
        message: MESSAGES.FILE.FILE_UPLOAD_SUCCESS,
        data: {
            filePath: `/public/image/post/${request.file.filename}`,
        },
    });
};
