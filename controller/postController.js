import * as postModel from '../model/postModel.js';
import { STATUS_CODES, MESSAGES } from '../util/responseConstants.js';
import * as fileModel from '../model/fileModel.js';
import { getFileIdByPostId } from '../model/fileModel.js';

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

/*
legacy code
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
            userId,
            postTitle,
            postContent,
            attachFilePath: attachFilePath === null ? null : attachFilePath,
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
                userId,
                postId: results.insertId,
                filePath: attachFilePath,
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
}; */
export const writePost = async (request, response) => {
    // 유효성 검사
    if (!request.body.postTitle) {
        return response.status(STATUS_CODES.BAD_REQUEST).json({
            status: STATUS_CODES.BAD_REQUEST,
            message: MESSAGES.POST.INVALID_POST_TITLE,
            data: null,
        });
    }
    if (request.body.postTitle.length > MAX_TITLE_LENGTH) {
        return response.status(STATUS_CODES.BAD_REQUEST).json({
            status: STATUS_CODES.BAD_REQUEST,
            message: MESSAGES.POST.INVALID_POST_TITLE_LENGTH,
            data: null,
        });
    }
    if (!request.body.postContent) {
        return response.status(STATUS_CODES.BAD_REQUEST).json({
            status: STATUS_CODES.BAD_REQUEST,
            message: MESSAGES.POST.INVALID_POST_CONTENT,
            data: null,
        });
    }
    if (request.body.postContent.length > MAX_CONTENT_LENGTH) {
        return response.status(STATUS_CODES.BAD_REQUEST).json({
            status: STATUS_CODES.BAD_REQUEST,
            message: MESSAGES.POST.INVALID_POST_CONTENT_LENGTH,
            data: null,
        });
    }

    try {
        const { postTitle, postContent, attachFilePath = null } = request.body;
        const userId = request.headers.userid;

        const requestData = {
            userId,
            postTitle,
            postContent,
            attachFilePath,
        };

        const results = await postModel.writePlainPost(requestData);

        if (!results) {
            throw new Error('POST_CREATION_FAILED');
        }

        if (attachFilePath != null) {
            const reqFileData = {
                userId,
                postId: results.insertId,
                filePath: attachFilePath,
            };

            const resFileData = await fileModel.uploadPostFile(reqFileData);
            results.filePath = resFileData;
        }

        return response.status(STATUS_CODES.CREATED).json({
            status: STATUS_CODES.CREATED,
            message: MESSAGES.POST.WRITE_POST_SUCCESS,
            data: results,
        });
    } catch (error) {
        console.error('Error writing post: ', error);

        let statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
        let message = MESSAGES.INTERNAL_SERVER_ERROR;

        switch (error.message) {
            case 'FILE_UPLOAD_FAILED':
                statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
                message = MESSAGES.FILE.FILE_UPLOAD_FAILED;
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
// 게시글 목록 조회
export const getPosts = async (request, response) => {
    const { offset, limit } = request.query;

    if (!offset || !limit) {
        return response.status(STATUS_CODES.BAD_REQUEST).json({
            status: STATUS_CODES.BAD_REQUEST,
            message: MESSAGES.POST.INVALID_OFFSET_LIMIT,
            data: null,
        });
    }

    try {
        const requestData = { offset, limit };
        const results = await postModel.getPosts(requestData);

        if (!results || results.length === 0) throw new Error('NO_POSTS_FOUND');

        return response.status(STATUS_CODES.OK).json({
            status: STATUS_CODES.OK,
            message: null,
            data: results,
        });
    } catch (error) {
        console.error('Error fetching posts:', error);

        let statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
        let message = MESSAGES.INTERNAL_SERVER_ERROR;

        switch (error.message) {
            case 'NO_POSTS_FOUND':
                statusCode = STATUS_CODES.NOT_FOUND;
                message = MESSAGES.POST.NO_POSTS_FOUND;
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
}; */

// 게시글 상세 조회
export const getPost = async (request, response) => {
    if (!request.params.post_id)
        return response.status(STATUS_CODES.BAD_REQUEST).json({
            status: STATUS_CODES.BAD_REQUEST,
            message: MESSAGES.POST.INVALID_POST_ID,
            data: null,
        });

    try {
        const postId = request.params.post_id;

        const requestData = {
            postId,
        };
        const results = await postModel.getPost(requestData, response);

        if (!results || results === null) throw new Error('NO_POST_FOUND');

        return response.status(STATUS_CODES.OK).json({
            status: STATUS_CODES.OK,
            message: null,
            data: results,
        });
    } catch (error) {
        console.error(error);

        let statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
        let message = MESSAGES.INTERNAL_SERVER_ERROR;

        switch (error.message) {
            case 'NO_POST_FOUND':
                statusCode = STATUS_CODES.NOT_FOUND;
                message = MESSAGES.POST.NO_POST_FOUND;
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

// 게시글 수정
export const updatePost = async (request, response) => {
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

    try {
        const postId = request.params.post_id;
        const userId = request.headers.userid;
        const { postTitle, postContent, attachFilePath = null } = request.body;

        const requestData = {
            postId,
            userId,
            postTitle,
            postContent,
            attachFilePath,
        };
        const results = await postModel.updatePost(requestData);

        if (!results) throw new Error('POST_UPDATE_FAILED');

        const legacyFileId = await fileModel.getFileIdByPostId(postId);
        const newFileId = await fileModel.getFileIdByPath(attachFilePath);

        if (attachFilePath !== null && legacyFileId !== newFileId) {
            const requestFileData = {
                userId,
                postId,
                filePath: attachFilePath,
            };

            const responseFileData =
                await fileModel.uploadPostFile(requestFileData);
            results.filePath = responseFileData;

            await fileModel.updatePostFileId(postId, responseFileData);
        }

        return response.status(STATUS_CODES.OK).json({
            status: STATUS_CODES.OK,
            message: MESSAGES.POST.UPDATE_POST_SUCCESS,
            data: results,
        });
    } catch (error) {
        console.error(error);

        let statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
        let message = MESSAGES.INTERNAL_SERVER_ERROR;

        switch (error.message) {
            case 'POST_UPDATE_FAILED':
                statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
                message = MESSAGES.POST.POST_UPDATE_FAILED;
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

// 게시글 삭제
export const softDeletePost = async (request, response) => {
    try {
        const postId = request.params.post_id;

        if (!postId) throw new Error('INVALID_POST_ID');

        const results = await postModel.softDeletePost(postId);

        if (!results) throw new Error('POST_DELETION_FAILED');

        return response.status(STATUS_CODES.OK).json({
            status: STATUS_CODES.OK,
            message: MESSAGES.POST.DELETE_POST_SUCCESS,
            data: null,
        });
    } catch (error) {
        console.error('Error soft deleting post:', error);

        let statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
        let message = MESSAGES.INTERNAL_SERVER_ERROR;

        switch (error.message) {
            case 'INVALID_POST_ID':
                statusCode = STATUS_CODES.BAD_REQUEST;
                message = MESSAGES.POST.INVALID_POST_ID;
                break;
            case 'POST_DELETION_FAILED':
                statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
                message = MESSAGES.POST.POST_DELETION_FAILED;
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
            postId,
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
*/
