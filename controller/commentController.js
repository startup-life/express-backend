const commentModel = require('../model/commentModel.js');
const {
    STATUS_CODE,
    STATUS_MESSAGE,
} = require('../util/constant/httpStatusCode');

// 댓글 조회
exports.getComments = async (request, response, next) => {
    const postId = request.params.post_id;

    if (!postId) {
        const error = new Error(STATUS_MESSAGE.INVALID_POST_ID);
        error.status = STATUS_CODE.BAD_REQUEST;
        throw error;
    }

    try {
        const requestData = {
            postId,
        };
        const responseData = await commentModel.getComments(requestData);

        if (!responseData || responseData.length === 0) {
            const error = new Error(STATUS_MESSAGE.NOT_A_SINGLE_COMMENT);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        return response.status(STATUS_CODE.OK).json({
            status: STATUS_CODE.OK,
            message: null,
            data: responseData,
        });
    } catch (error) {
        return next(error);
    }
};

// 댓글 작성
exports.writeComment = async (request, response, next) => {
    const postId = request.params.post_id;
    const userId = request.headers.userid;
    const { commentContent } = request.body;

    if (!postId) {
        const error = new Error(STATUS_MESSAGE.INVALID_POST_ID);
        error.status = STATUS_CODE.BAD_REQUEST;
        throw error;
    }

    if (!commentContent) {
        const error = new Error(STATUS_MESSAGE.INVALID_COMMENT_CONTENT);
        error.status = STATUS_CODE.BAD_REQUEST;
        throw error;
    }

    if (commentContent.length > 1000) {
        const error = new Error(STATUS_MESSAGE.INVALID_COMMENT_CONTENT_LENGTH);
        error.status = STATUS_CODE.BAD_REQUEST;
        throw error;
    }

    try {
        const requestData = {
            postId,
            userId,
            commentContent,
        };

        const responseData = await commentModel.writeComment(requestData);

        if (!responseData) {
            const error = new Error(STATUS_MESSAGE.NOT_A_SINGLE_POST);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        if (responseData === 'insert_error') {
            const error = new Error(STATUS_MESSAGE.INTERNAL_SERVER_ERROR);
            error.status = STATUS_CODE.INTERNAL_SERVER_ERROR;
            throw error;
        }

        return response.status(STATUS_CODE.CREATED).json({
            status: STATUS_CODE.CREATED,
            message: STATUS_MESSAGE.WRITE_COMMENT_SUCCESS,
            data: null,
        });
    } catch (error) {
        return next(error);
    }
};

// 댓글 수정
exports.updateComment = async (request, response, next) => {
    const { post_id, comment_id } = request.params;
    const userId = request.headers.userid;
    const { commentContent } = request.body;

    if (!post_id) {
        const error = new Error(STATUS_MESSAGE.INVALID_POST_ID);
        error.status = STATUS_CODE.BAD_REQUEST;
        throw error;
    }

    if (!comment_id) {
        const error = new Error(STATUS_MESSAGE.INVALID_COMMENT_ID);
        error.status = STATUS_CODE.BAD_REQUEST;
        throw error;
    }

    if (!commentContent) {
        const error = new Error(STATUS_MESSAGE.INVALID_COMMENT_CONTENT);
        error.status = STATUS_CODE.BAD_REQUEST;
        throw error;
    }

    if (commentContent.length > 1000) {
        const error = new Error(STATUS_MESSAGE.INVALID_COMMENT_CONTENT_LENGTH);
        error.status = STATUS_CODE.BAD_REQUEST;
        throw error;
    }

    try {
        const requestData = {
            postId: post_id,
            commentId: comment_id,
            userId,
            commentContent,
        };
        const responseData = await commentModel.updateComment(requestData);

        if (!responseData) {
            const error = new Error(STATUS_MESSAGE.NOT_A_SINGLE_POST);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        if (responseData === 'update_error') {
            const error = new Error(STATUS_MESSAGE.INTERNAL_SERVER_ERROR);
            error.status = STATUS_CODE.INTERNAL_SERVER_ERROR;
            throw error;
        }

        return response.status(STATUS_CODE.OK).json({
            status: STATUS_CODE.OK,
            message: STATUS_MESSAGE.UPDATE_COMMENT_SUCCESS,
            data: null,
        });
    } catch (error) {
        return next(error);
    }
};

// 댓글 삭제
exports.softDeleteComment = async (request, response, next) => {
    const { post_id: postId, comment_id: commentId } = request.params;
    const { userid: userId } = request.headers;

    if (!postId) {
        const error = new Error(STATUS_MESSAGE.INVALID_POST_ID);
        error.status = STATUS_CODE.BAD_REQUEST;
        throw error;
    }

    if (!commentId) {
        const error = new Error(STATUS_MESSAGE.INVALID_COMMENT_ID);
        error.status = STATUS_CODE.BAD_REQUEST;
        throw error;
    }

    try {
        const requestData = {
            postId,
            commentId,
            userId,
        };
        const results = await commentModel.softDeleteComment(requestData);

        if (!results) {
            const error = new Error(STATUS_MESSAGE.NOT_A_SINGLE_POST);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        if (results === 'no_auth_error') {
            const error = new Error(STATUS_MESSAGE.REQUIRED_AUTHORIZATION);
            error.status = STATUS_CODE.UNAUTHORIZED;
            throw error;
        }

        if (results === 'delete_error') {
            const error = new Error(STATUS_MESSAGE.INTERNAL_SERVER_ERROR);
            error.status = STATUS_CODE.INTERNAL_SERVER_ERROR;
            throw error;
        }

        return response.status(STATUS_CODE.OK).json({
            status: STATUS_CODE.OK,
            message: STATUS_MESSAGE.DELETE_COMMENT_SUCCESS,
            data: null,
        });
    } catch (error) {
        return next(error);
    }
};
