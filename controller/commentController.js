import mysql from 'mysql2/promise';
import * as commentModel from '../model/commentModel.js';
import { STATUS_CODES, MESSAGES } from '../util/responseConstants.js';

/**
 * 댓글 작성
 * 댓글 조회
 * 댓글 수정
 * 댓글 삭제
 */

const MAX_COMMENT_LENGTH = 1000;

// 댓글 작성
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
            postId: mysql.escape(postId),
            userId: mysql.escape(userId),
            commentContent: mysql.escape(commentContent),
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
        response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
            message: MESSAGES.INTERNAL_SERVER_ERROR,
            data: null,
        });
    }
};

// 댓글 조회
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
            postId: mysql.escape(postId),
        };
        const results = await commentModel.getComments(requestData, response);
        console.log(results);
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
};

// 댓글 수정
export const updateComment = async (request, response) => {
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
    try {
        const postId = request.params.post_id;
        const commentId = request.params.comment_id;
        const userId = request.headers.userid;
        const { commentContent } = request.body;

        const requestData = {
            postId: mysql.escape(postId),
            commentId: mysql.escape(commentId),
            userId: mysql.escape(userId),
            commentContent: mysql.escape(commentContent),
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
};

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
            postId: mysql.escape(postId),
            commentId: mysql.escape(commentId),
            userId: mysql.escape(userId),
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
