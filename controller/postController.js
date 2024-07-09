const mysql = require('mysql2/promise');
const postModel = require('../model/postModel.js');
const {
    STATUS_CODE,
    STATUS_MESSAGE,
} = require('../util/constant/httpStatusCode');

/**
 * 게시글 작성
 * 파일 업로드
 * 게시글 목록 조회
 * 게시글 상세 조회
 * 게시글 수정
 */

// 게시글 작성
exports.writePost = async (request, response, next) => {
    try {
        const { postTitle, postContent, attachFilePath } = request.body;
        const userId = request.headers.userid;

        if (!postTitle) {
            const error = new Error(STATUS_MESSAGE.INVALID_POST_TITLE);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }
        if (postTitle.length > 26) {
            const error = new Error(STATUS_MESSAGE.INVALID_POST_TITLE_LENGTH);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }
        if (!postContent) {
            const error = new Error(STATUS_MESSAGE.INVALID_POST_CONTENT);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }
        if (postContent.length > 1500) {
            const error = new Error(STATUS_MESSAGE.INVALID_POST_CONTENT_LENGHT);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }

        const requestData = {
            userId,
            postTitle,
            postContent,
            attachFilePath: attachFilePath || null,
        };
        const responseData = await postModel.writePost(requestData);

        if (responseData === STATUS_MESSAGE.NOT_FOUND_USER) {
            const error = new Error(STATUS_MESSAGE.NOT_FOUND_USER);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        if (!responseData) {
            const error = new Error(STATUS_MESSAGE.WRITE_POST_FAILED);
            error.status = STATUS_CODE.INTERNAL_SERVER_ERROR;
            throw error;
        }

        return response.status(STATUS_CODE.CREATED).json({
            status: STATUS_CODE.CREATED,
            message: STATUS_MESSAGE.WRITE_POST_SUCCESS,
            data: responseData,
        });
    } catch (error) {
        next(error);
    }
};
/*exports.writePost = async (request, response) => {
    try {
        if (request.attachFilePath === undefined) request.attachFilePath = null;
        if (!request.body.postTitle)
            return response.status(400).json({
                status: 400,
                message: 'invalid_post_title',
                data: null,
            });
        if (request.body.postTitle.length > 26)
            return response.status(400).json({
                status: 400,
                message: 'invalid_post_title_length',
                data: null,
            });
        if (!request.body.postContent)
            return response.status(400).json({
                status: 400,
                message: 'invalid_post_content',
                data: null,
            });
        if (request.body.postContent.length > 1500)
            return response.status(400).json({
                status: 400,
                message: 'invalid_post_content_length',
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
            return response.status(500).json({
                status: 500,
                message: 'failed_to_write_post',
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

        return response.status(201).json({
            status: 201,
            message: 'write_post_success',
            data: results,
        });
    } catch (error) {
        console.error(error);
        return response.status(500).json({
            status: 500,
            message: 'internal_server_error',
            data: null,
        });
    }
};

// 파일 업로드
exports.uploadFile = async (request, response) => {
    try {
        if (!request.filePath)
            return response.status(400).json({
                status: 400,
                message: 'invalid_file_path',
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
            return response.status(500).json({
                status: 500,
                message: 'internal_server_error',
                data: null,
            });

        return response.status(201).json({
            status: 201,
            message: null,
            data: results,
        });
    } catch (error) {
        console.error(error);
        return response.status(500).json({
            status: 500,
            message: 'internal_server_error',
            data: null,
        });
    }
};*/

// 게시글 목록 조회
exports.getPosts = async (request, response, next) => {
    try {
        const { offset, limit } = request.query;

        if (!offset || !limit) {
            const error = new Error(STATUS_MESSAGE.INVALID_OFFSET_OR_LIMIT);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }

        const requestData = {
            offset: parseInt(offset, 10),
            limit: parseInt(limit, 10),
        };
        const responseData = await postModel.getPosts(requestData);

        if (!responseData || responseData.length === 0) {
            const error = new Error(STATUS_MESSAGE.NOT_A_SINGLE_POST);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        return response.status(STATUS_CODE.OK).json({
            status: STATUS_CODE.OK,
            message: STATUS_MESSAGE.GET_POSTS_SUCCESS,
            data: responseData,
        });
    } catch (error) {
        next(error);
    }
};
/*exports.getPosts = async (request, response) => {
    try {
        if (!request.query.offset || !request.query.limit)
            return response.status(400).json({
                status: 400,
                message: 'invalid_offset_or_limit',
                data: null,
            });

        const { offset, limit } = request.query;

        const requestData = {
            offset,
            limit,
        };
        const results = await postModel.getPosts(requestData, response);

        if (!results || results === null)
            return response.status(404).json({
                status: 404,
                message: 'not_a_single_post',
                data: null,
            });

        return response.status(200).json({
            status: 200,
            message: null,
            data: results,
        });
    } catch (error) {
        console.error(error);
        return response.status(500).json({
            status: 500,
            message: 'internal_server_error',
            data: null,
        });
    }
};*/

// 게시글 상세 조회
exports.getPost = async (request, response, next) => {
    try {
        const postId = request.params.post_id;

        if (!postId) {
            const error = new Error(STATUS_MESSAGE.INVALID_POST_ID);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }

        const requestData = {
            postId,
        };
        const responseData = await postModel.getPost(requestData, response);

        if (!responseData) {
            const error = new Error(STATUS_MESSAGE.NOT_A_SINGLE_POST);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        return response.status(STATUS_CODE.OK).json({
            status: STATUS_CODE.OK,
            message: null,
            data: responseData,
        });
    } catch (error) {
        next(error);
    }
};

// 게시글 수정
exports.updatePost = async (request, response, next) => {
    try {
        const postId = request.params.post_id;
        const userId = request.headers.userid;
        const { postTitle, postContent, attachFilePath } = request.body;

        if (!postId) {
            const error = new Error(STATUS_MESSAGE.INVALID_POST_ID);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }

        if (postTitle.length > 26) {
            const error = new Error(STATUS_MESSAGE.INVALID_POST_TITLE_LENGTH);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }

        const requestData = {
            postId,
            userId,
            postTitle,
            postContent,
            attachFilePath: attachFilePath || null,
        };
        const responseData = await postModel.updatePost(requestData);

        if (!responseData) {
            const error = new Error(STATUS_MESSAGE.NOT_A_SINGLE_POST);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        return response.status(STATUS_CODE.OK).json({
            status: STATUS_CODE.OK,
            message: STATUS_MESSAGE.UPDATE_POST_SUCCESS,
            data: responseData,
        });
    } catch (error) {
        next(error);
    }
};
/*exports.updatePost = async (request, response) => {
    try {
        if (!request.params.post_id)
            return response.status(400).json({
                status: 400,
                message: 'invalid_post_id',
                data: null,
            });

        if (request.body.postTitle.length > 26)
            return response.status(400).json({
                status: 400,
                message: 'invalid_post_title_length',
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
            return response.status(404).json({
                status: 404,
                message: 'not_a_single_post',
                data: null,
            });

        return response.status(200).json({
            status: 200,
            message: 'update_post_success',
            data: results,
        });
    } catch (error) {
        console.error(error);
        return response.status(500).json({
            status: 500,
            message: 'internal_server_error',
            data: null,
        });
    }
};*/

// 게시글 삭제
exports.softDeletePost = async (request, response, next) => {
    try {
        const postId = request.params.post_id;

        if (!postId) {
            const error = new Error(STATUS_MESSAGE.INVALID_POST_ID);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }

        const requestData = {
            postId,
        };
        const results = await postModel.softDeletePost(requestData);

        if (!results) {
            const error = new Error(STATUS_MESSAGE.NOT_A_SINGLE_POST);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        return response.status(STATUS_CODE.OK).json({
            status: STATUS_CODE.OK,
            message: STATUS_MESSAGE.DELETE_POST_SUCCESS,
            data: null,
        });
    } catch (error) {
        return next(error);
    }
};
/*exports.softDeletePost = async (request, response) => {
    try {
        if (!request.params.post_id)
            return response.status(400).json({
                status: 400,
                message: 'invalid_post_id',
                data: null,
            });

        const postId = request.params.post_id;

        const requestData = {
            postId: mysql.escape(postId),
        };
        const results = await postModel.softDeletePost(requestData, response);

        if (!results || results === null)
            return response.status(404).json({
                status: 404,
                message: 'not_a_single_post',
                data: null,
            });

        return response.status(200).json({
            status: 200,
            message: 'delete_post_success',
            data: null,
        });
    } catch (error) {
        console.error(error);
        return response.status(500).json({
            status: 500,
            message: 'internal_server_error',
            data: null,
        });
    }
};*/
