import mysql from 'mysql2/promise';
import * as postModel from '../model/postModel.js';
import { STATUS_CODES, MESSAGES } from '../util/responseConstants.js';

/**
 * 게시글 작성
 * 파일 업로드
 * 게시글 목록 조회
 * 게시글 상세 조회
 * 게시글 수정
 */

const MAX_TITLE_LENGTH = 26;
const MAX_CONTENT_LENGTH = 1500;

// 게시글 작성
export const writePost = async (request, response) => {
    try {
        if (request.attachFilePath === undefined) request.attachFilePath = null;
        if (!request.body.postTitle)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.POST.INVALID_POST_TITLE,
                data: null,
            });
        if (request.body.postTitle.length > MAX_TITLE_LENGTH)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.POST.INVALID_POST_TITLE_LENGTH,
                data: null,
            });
        if (!request.body.postContent)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.POST.INVALID_POST_CONTENT,
                data: null,
            });
        if (request.body.postContent.length > MAX_CONTENT_LENGTH)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.POST.INVALID_POST_CONTENT_LENGTH,
                data: null,
            });

        const { postTitle, postContent, attachFilePath } = request.body;
        const userId = request.headers.userid;

        const requestData = {
            userId: mysql.escape(userId),
            postTitle: mysql.escape(postTitle),
            postContent: mysql.escape(postContent),
            attachFilePath:
                attachFilePath === null ? null : mysql.escape(attachFilePath),
        };
        const results = await postModel.writePlainPost(requestData, response);

        if (!results || results === null)
            return response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                status: STATUS_CODES.INTERNAL_SERVER_ERROR,
                message: MESSAGES.INTERNAL_SERVER_ERROR,
                data: null,
            });

        if (attachFilePath != null) {
            const reqFileData = {
                userId: mysql.escape(userId),
                postId: results.insertId,
                filePath: mysql.escape(attachFilePath),
            };

            const resFileData = await postModel.uploadFile(
                reqFileData,
                response,
            );
            results.filePath = resFileData;
        }

        return response.status(STATUS_CODES.CREATED).json({
            status: STATUS_CODES.CREATED,
            message: MESSAGES.POST.WRITE_POST_SUCCESS,
            data: results,
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

// 파일 업로드
export const uploadFile = async (request, response) => {
    try {
        if (!request.filePath)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.FILE.INVALID_FILE_PATH,
                data: null,
            });

        const { userId, postId, filePath } = request.body;

        const requestData = {
            userId,
            postId,
            filePath,
        };
        const results = await postModel.uploadFile(requestData, response);

        if (!results || results === null)
            return response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                status: STATUS_CODES.INTERNAL_SERVER_ERROR,
                message: MESSAGES.INTERNAL_SERVER_ERROR,
                data: null,
            });

        return response.status(STATUS_CODES.CREATED).json({
            status: STATUS_CODES.CREATED,
            message: null,
            data: results,
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

// 게시글 목록 조회
export const getPosts = async (request, response) => {
    try {
        if (!request.query.offset || !request.query.limit)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.POST.INVALID_OFFSET_LIMIT,
                data: null,
            });

        const { offset, limit } = request.query;

        const requestData = {
            offset,
            limit,
        };
        const results = await postModel.getPosts(requestData, response);

        if (!results || results === null)
            return response.status(STATUS_CODES.NOT_FOUND).json({
                status: STATUS_CODES.NOT_FOUND,
                message: MESSAGES.POST.NOT_A_SINGLE_POST,
                data: null,
            });

        return response.status(STATUS_CODES.OK).json({
            status: STATUS_CODES.OK,
            message: null,
            data: results,
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

// 게시글 상세 조회
export const getPost = async (request, response) => {
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
        const results = await postModel.getPost(requestData, response);

        if (!results || results === null)
            return response.status(STATUS_CODES.NOT_FOUND).json({
                status: STATUS_CODES.NOT_FOUND,
                message: MESSAGES.POST.NOT_A_SINGLE_POST,
                data: null,
            });

        return response.status(STATUS_CODES.OK).json({
            status: STATUS_CODES.OK,
            message: null,
            data: results,
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

// 게시글 수정
export const updatePost = async (request, response) => {
    try {
        if (!request.params.post_id)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.POST.INVALID_POST_ID,
                data: null,
            });

        if (request.body.postTitle.length > MAX_TITLE_LENGTH)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.POST.INVALID_POST_TITLE_LENGTH,
                data: null,
            });

        const postId = request.params.post_id;
        const userId = request.headers.userid;
        const { postTitle, postContent, attachFilePath } = request.body;

        const requestData = {
            postId: mysql.escape(postId),
            userId: mysql.escape(userId),
            postTitle: mysql.escape(postTitle),
            postContent: mysql.escape(postContent),
            attachFilePath:
                attachFilePath === undefined
                    ? null
                    : mysql.escape(attachFilePath),
        };
        const results = await postModel.updatePost(requestData, response);

        if (!results || results === null)
            return response.status(STATUS_CODES.NOT_FOUND).json({
                status: STATUS_CODES.NOT_FOUND,
                message: MESSAGES.POST.NOT_A_SINGLE_POST,
                data: null,
            });

        return response.status(STATUS_CODES.OK).json({
            status: STATUS_CODES.OK,
            message: MESSAGES.POST.UPDATE_POST_SUCCESS,
            data: results,
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

// 게시글 삭제
export const softDeletePost = async (request, response) => {
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
        const results = await postModel.softDeletePost(requestData, response);

        if (!results || results === null)
            return response.status(STATUS_CODES.NOT_FOUND).json({
                status: STATUS_CODES.NOT_FOUND,
                message: MESSAGES.POST.NOT_A_SINGLE_POST,
                data: null,
            });

        return response.status(STATUS_CODES.OK).json({
            status: STATUS_CODES.OK,
            message: MESSAGES.POST.DELETE_POST_SUCCESS,
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
