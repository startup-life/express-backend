import * as commentModel from '../model/commentModel.js';
import { STATUS_CODES, MESSAGES } from '../util/responseConstants.js';
import * as userModel from '../model/userModel.js';
import * as postModel from '../model/postModel.js';
import * as dbConnect from '../database/index.js';

/**
 * 댓글 작성
 * 댓글 조회
 * 댓글 수정
 * 댓글 삭제
 */

const MAX_COMMENT_LENGTH = 1000;

// 댓글 작성
export const writeComment = async (request, response) => {
    // 유효성 검사
    if (!request.params.post_id) {
        return response.status(STATUS_CODES.BAD_REQUEST).json({
            status: STATUS_CODES.BAD_REQUEST,
            message: MESSAGES.POST.INVALID_POST_ID,
            data: null,
        });
    }

    if (!request.body.commentContent) {
        return response.status(STATUS_CODES.BAD_REQUEST).json({
            status: STATUS_CODES.BAD_REQUEST,
            message: MESSAGES.COMMENT.INVALID_COMMENT_CONTENT,
            data: null,
        });
    }

    if (request.body.commentContent.length > MAX_COMMENT_LENGTH) {
        return response.status(STATUS_CODES.BAD_REQUEST).json({
            status: STATUS_CODES.BAD_REQUEST,
            message: MESSAGES.INVALID_COMMENT_CONTENT_LENGTH,
            data: null,
        });
    }

    try {
        const postId = request.params.post_id;
        const { commentContent } = request.body;
        const userId = request.headers.userid;

        // 유저 닉네임 가져오기
        const nickname = await userModel.getNicknameById(userId);
        if (!nickname) {
            throw new Error('USER_NOT_FOUND');
        }

        // 포스트 유효성 검사
        const postExists = await postModel.checkPostExists(postId);
        if (!postExists) {
            throw new Error('POST_NOT_FOUND');
        }

        // 댓글 작성
        const commentData = {
            postId,
            userId,
            nickname,
            commentContent,
        };
        const results = await commentModel.writeComment(commentData);

        return response.status(STATUS_CODES.CREATED).json({
            status: STATUS_CODES.CREATED,
            message: MESSAGES.COMMENT.WRITE_COMMENT_SUCCESS,
            data: results,
        });
    } catch (error) {
        console.error(error);

        let statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
        let message = MESSAGES.INTERNAL_SERVER_ERROR;

        // 에러 메시지에 따른 상태 코드 및 메시지 설정
        switch (error.message) {
            case 'USER_NOT_FOUND':
                statusCode = STATUS_CODES.NOT_FOUND;
                message = MESSAGES.USER.NOT_FOUND;
                break;
            case 'POST_NOT_FOUND':
                statusCode = STATUS_CODES.NOT_FOUND;
                message = MESSAGES.POST.NOT_FOUND;
                break;
            case 'INSERT_ERROR':
                statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
                message = MESSAGES.INTERNAL_SERVER_ERROR;
                break;
            default:
                break;
        }

        return response.status(statusCode).json({
            status: statusCode,
            message,
            data: null,
        });
    }
};
/*
legacy code

export const writeComment = async (request, response) => {
    try {
        if (!request.params.post_id)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.POST.INVALID_POST_ID,
                data: null,
            });

        if (!request.body.commentContent)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.COMMENT.INVALID_COMMENT_CONTENT,
                data: null,
            });

        if (request.body.commentContent.length > MAX_COMMENT_LENGTH)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.INVALID_COMMENT_CONTENT_LENGTH,
                data: null,
            });

        const postId = request.params.post_id;
        const { commentContent } = request.body;
        const userId = request.headers.userid;

        const requestData = {
            postId,
            userId,
            commentContent,
        };
        const results = await commentModel.writeComment(requestData, response);

        if (!results)
            return response.status(STATUS_CODES.NOT_FOUND).json({
                status: STATUS_CODES.NOT_FOUND,
                message: MESSAGES.NOT_A_SINGLE_POST,
                data: null,
            });

        if (results === 'insert_error')
            return response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                status: STATUS_CODES.INTERNAL_SERVER_ERROR,
                message: MESSAGES.INTERNAL_SERVER_ERROR,
                data: null,
            });

        return response.status(STATUS_CODES.CREATED).json({
            status: STATUS_CODES.CREATED,
            message: MESSAGES.COMMENT.WRITE_COMMENT_SUCCESS,
            data: null,
        });
    } catch (error) {
        console.error(error);
        return response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
            message: MESSAGES.INTERNAL_SERVER_ERROR,
            data: null,
        });
    }
};
*/

// 댓글 조회
export const getComments = async (request, response) => {
    try {
        const postId = request.params.post_id;

        if (!postId) throw new Error('POST_ID_NOT_FOUND');

        const results = await commentModel.getComments(postId);

        if (!results) throw new Error('NOT_A_SINGLE_COMMENT');

        return response.status(STATUS_CODES.OK).json({
            status: STATUS_CODES.OK,
            message: null,
            data: results,
        });
    } catch (error) {
        console.error('Error fetching comments:', error);

        let statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
        let message = MESSAGES.INTERNAL_SERVER_ERROR;

        switch (error.message) {
            case 'POST_ID_NOT_FOUND':
                statusCode = STATUS_CODES.BAD_REQUEST;
                message = MESSAGES.POST.INVALID_POST_ID;
                break;
            case 'NOT_A_SINGLE_COMMENT':
                statusCode = STATUS_CODES.NOT_FOUND;
                message = MESSAGES.COMMENT.NOT_A_SINGLE_COMMENT;
                break;
            default:
                break;
        }

        return response.status(statusCode).json({
            status: statusCode,
            message,
            data: null,
        });
    }
};
/*
legacy code
export const getComments = async (request, response) => {
    try {
        if (!request.params.post_id)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.POST.INVALID_POST_ID,
                data: null,
            });

        const postId = request.params.post_id;

        const requestData = {
            postId,
        };
        const results = await commentModel.getComments(requestData, response);

        if (!results)
            return response.status(STATUS_CODES.NOT_FOUND).json({
                status: STATUS_CODES.NOT_FOUND,
                message: MESSAGES.COMMENT.NOT_A_SINGLE_COMMENT,
                data: null,
            });

        return response.status(STATUS_CODES.OK).json({
            status: STATUS_CODES.OK,
            message: null,
            data: results,
        });
    } catch (error) {
        console.error(error);
        response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
            message: MESSAGES.INTERNAL_SERVER_ERROR,
            data: null,
        });
    }
}; */

// 댓글 수정
export const updateComment = async (request, response) => {
    const postId = request.params.post_id;
    const commentId = request.params.comment_id;
    const { commentContent } = request.body;
    const userId = request.headers.userid;

    if (!postId) {
        return response.status(STATUS_CODES.BAD_REQUEST).json({
            status: STATUS_CODES.BAD_REQUEST,
            message: MESSAGES.POST.INVALID_POST_ID,
            data: null,
        });
    }

    if (!commentId) {
        return response.status(STATUS_CODES.BAD_REQUEST).json({
            status: STATUS_CODES.BAD_REQUEST,
            message: MESSAGES.COMMENT.INVALID_COMMENT_ID,
            data: null,
        });
    }

    if (!commentContent) {
        return response.status(STATUS_CODES.BAD_REQUEST).json({
            status: STATUS_CODES.BAD_REQUEST,
            message: MESSAGES.COMMENT.INVALID_COMMENT_CONTENT,
            data: null,
        });
    }

    if (commentContent.length > MAX_COMMENT_LENGTH) {
        return response.status(STATUS_CODES.BAD_REQUEST).json({
            status: STATUS_CODES.BAD_REQUEST,
            message: MESSAGES.COMMENT.INVALID_COMMENT_CONTENT_LENGTH,
            data: null,
        });
    }

    try {
        const checkPostData = {
            postId,
        };
        const checkPostResult = await postModel.getPost(checkPostData);

        if (!checkPostResult) throw new Error('POST_NOT_FOUND');

        const requestData = {
            postId,
            commentId,
            userId,
            commentContent,
        };
        const results = await commentModel.updateComment(requestData);

        if (!results) throw new Error('NOT_A_SINGLE_COMMENT');

        return response.status(STATUS_CODES.OK).json({
            status: STATUS_CODES.OK,
            message: MESSAGES.COMMENT.UPDATE_COMMENT_SUCCESS,
            data: null,
        });
    } catch (error) {
        console.error('Error updating comment:', error);

        let statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
        let message = MESSAGES.INTERNAL_SERVER_ERROR;

        switch (error.message) {
            case 'POST_NOT_FOUND':
                statusCode = STATUS_CODES.NOT_FOUND;
                message = MESSAGES.POST.NOT_FOUND;
                break;
            case 'NOT_A_SINGLE_COMMENT':
                statusCode = STATUS_CODES.NOT_FOUND;
                message = MESSAGES.COMMENT.NOT_A_SINGLE_COMMENT;
                break;
            default:
                break;
        }

        return response.status(statusCode).json({
            status: statusCode,
            message,
            data: null,
        });
    }
};
/*
legacy code
export const updateComment = async (request, response) => {
    try {
        if (!request.params.post_id)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.POST.INVALID_POST_ID,
                data: null,
            });
        if (!request.params.comment_id)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.COMMENT.INVALID_COMMENT_ID,
                data: null,
            });
        if (!request.body.commentContent)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.COMMENT.INVALID_COMMENT_CONTENT,
                data: null,
            });
        if (request.body.commentContent.length > MAX_COMMENT_LENGTH)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.COMMENT.INVALID_COMMENT_CONTENT_LENGTH,
                data: null,
            });

        const postId = request.params.post_id;
        const commentId = request.params.comment_id;
        const userId = request.headers.userid;
        const { commentContent } = request.body;

        const requestData = {
            postId,
            commentId,
            userId,
            commentContent,
        };
        const results = await commentModel.updateComment(requestData, response);

        if (!results)
            return response.status(STATUS_CODES.NOT_FOUND).json({
                status: STATUS_CODES.NOT_FOUND,
                message: MESSAGES.COMMENT.NOT_A_SINGLE_COMMENT,
                data: null,
            });

        if (results === 'update_error')
            return response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                status: STATUS_CODES.INTERNAL_SERVER_ERROR,
                message: MESSAGES.INTERNAL_SERVER_ERROR,
                data: null,
            });

        return response.status(STATUS_CODES.OK).json({
            status: STATUS_CODES.OK,
            message: MESSAGES.COMMENT.UPDATE_COMMENT_SUCCESS,
            data: null,
        });
    } catch (error) {
        console.error(error);
        response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
            message: MESSAGES.INTERNAL_SERVER_ERROR,
            data: null,
        });
    }
}; */

// 댓글 삭제
export const softDeleteComment = async (request, response) => {
    try {
        if (!request.params.post_id)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.POST.INVALID_POST_ID,
                data: null,
            });

        if (!request.params.comment_id)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.COMMENT.INVALID_COMMENT_ID,
                data: null,
            });

        const postId = request.params.post_id;
        const commentId = request.params.comment_id;
        const userId = request.headers.userid;

        const requestData = {
            postId,
            commentId,
            userId,
        };
        const results = await commentModel.softDeleteComment(
            requestData,
            response,
        );

        if (!results)
            return response.status(STATUS_CODES.NOT_FOUND).json({
                status: STATUS_CODES.NOT_FOUND,
                message: MESSAGES.COMMENT.NOT_A_SINGLE_COMMENT,
                data: null,
            });

        if (results === 'delete_error')
            return response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                status: STATUS_CODES.INTERNAL_SERVER_ERROR,
                message: MESSAGES.INTERNAL_SERVER_ERROR,
                data: null,
            });

        return response.status(STATUS_CODES.OK).json({
            status: STATUS_CODES.OK,
            message: MESSAGES.COMMENT.DELETE_COMMENT_SUCCESS,
            data: null,
        });
    } catch (error) {
        console.error(error);
        response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
            message: MESSAGES.INTERNAL_SERVER_ERROR,
            data: null,
        });
    }
};
