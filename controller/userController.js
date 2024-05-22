import bcrypt from 'bcrypt';
import * as userModel from '../model/userModel.js';
import { validEmail, validNickname, validPassword } from '../util/validUtil.js';
import { STATUS_CODES, MESSAGES } from '../util/responseConstants.js';
import * as fileModel from '../model/fileModel.js';
import * as postModel from '../model/postModel.js';

const SALTROUNDS = 10;

/**
 * 회원가입
 * 프로필 사진 업로드
 * 로그인
 * 유저 정보 가져오기
 * 회원정보 수정
 * 비밀번호 변경
 * 회원탈퇴
 * 로그아웃
 */

// 회원가입
export const signupUser = async (request, response) => {
    try {
        const {
            email,
            password,
            nickname,
            profileImagePath = null,
        } = request.body;

        // 입력 검증
        if (!validEmail(email)) {
            throw new Error(MESSAGES.USER.INVALID_USER_EMAIL);
        }

        if (!validNickname(nickname)) {
            throw new Error(MESSAGES.USER.INVALID_USER_NICKNAME);
        }

        if (!validPassword(password)) {
            throw new Error(MESSAGES.USER.INVALID_USER_PASSWORD);
        }

        const hashedPassword = await bcrypt.hash(password, SALTROUNDS);

        const requestSignupData = {
            email,
            password: hashedPassword,
            nickname,
            profileImagePath,
        };

        const responseSignupData =
            await userModel.signUpUser(requestSignupData);

        if (responseSignupData === null) {
            throw new Error(MESSAGES.USER.ALREADY_EXIST_EMAIL);
        }

        if (profileImagePath !== null) {
            const requestProfileImageData = {
                userId: responseSignupData,
                profileImagePath,
            };

            const responseProfileImageData = await fileModel.uploadProfileImage(
                requestProfileImageData,
            );
            requestSignupData.file_id = responseProfileImageData.insertId;
        }

        return response.status(STATUS_CODES.CREATED).json({
            status: STATUS_CODES.CREATED,
            message: MESSAGES.USER.SIGNUP_SUCCESS,
            data: {
                userId: responseSignupData,
                profileImageId: requestSignupData.file_id,
            },
        });
    } catch (error) {
        let statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
        let message = MESSAGES.INTERNAL_SERVER_ERROR;

        switch (error.message) {
            case MESSAGES.USER.INVALID_USER_EMAIL:
            case MESSAGES.USER.INVALID_USER_NICKNAME:
            case MESSAGES.USER.INVALID_USER_PASSWORD:
            case MESSAGES.USER.ALREADY_EXIST_EMAIL:
                statusCode = STATUS_CODES.BAD_REQUEST;
                message = error.message;
                break;
            default:
                console.log(error);
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

export const signupUser = async (request, response) => {
    if (request.body.profileImagePath === undefined)
        request.body.profileImagePath = null;
    try {
        const emailValid = validEmail(request.body.email);
        const nicknameValid = validNickname(request.body.nickname);
        const passwordValid = validPassword(request.body.password);

        if (!request.body.email || !emailValid)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.USER.INVALID_USER_EMAIL,
                data: null,
            });
        if (!request.body.nickname || !nicknameValid)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.USER.INVALID_USER_NICKNAME,
                data: null,
            });
        if (!request.body.password || !passwordValid)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.USER.INVALID_USER_PASSWORD,
                data: null,
            });

        const { email, password, nickname, profileImagePath } = request.body;

        const hashedPassword = await bcrypt.hash(password, SALTROUNDS);

        const requestSignupData = {
            email,
            password: hashedPassword,
            nickname,
            profileImagePath,
        };

        const responseSignupData =
            await userModel.signUpUser(requestSignupData);

        if (responseSignupData === null)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.USER.ALREADY_EXIST_EMAIL,
                data: null,
            });

        if (profileImagePath !== null) {
            const requestProfileImageData = {
                userId: responseSignupData,
                profileImagePath,
            };

            const responseProfileImageData = await userModel.uploadProfileImage(
                requestProfileImageData,
                response,
            );
            requestSignupData.file_id = responseProfileImageData.insertId;
        }

        return response.status(STATUS_CODES.CREATED).json({
            status: STATUS_CODES.CREATED,
            message: MESSAGES.USER.SIGNUP_SUCCESS,
            data: {
                userId: responseSignupData.insertId,
                profileImageId: requestSignupData.file_id,
            },
        });
    } catch (error) {
        console.log(error);
        return response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
            message: MESSAGES.INTERNAL_SERVER_ERROR,
            data: null,
        });
    }
}; */

// 로그인
export const loginUser = async (request, response) => {
    if (!request.body.email) {
        return response.status(STATUS_CODES.BAD_REQUEST).json({
            status: STATUS_CODES.BAD_REQUEST,
            message: MESSAGES.USER.INVALID_USER_EMAIL,
            data: null,
        });
    }

    if (!request.body.password) {
        return response.status(STATUS_CODES.BAD_REQUEST).json({
            status: STATUS_CODES.BAD_REQUEST,
            message: MESSAGES.USER.INVALID_USER_PASSWORD,
            data: null,
        });
    }

    const { email, password } = request.body;

    try {
        const user = await userModel.loginUser(email);

        if (!user) {
            throw new Error('INVALID_EMAIL_OR_PASSWORD');
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            throw new Error('INVALID_EMAIL_OR_PASSWORD');
        }

        user.profileImagePath = user.file_id
            ? await userModel.getProfileImagePath(user.file_id)
            : '/public/image/profile/default.png';

        const responseData = {
            userId: user.user_id,
            email: user.email,
            nickname: user.nickname,
            profileImagePath: user.profileImagePath,
            created_at: user.created_at,
            updated_at: user.updated_at,
            deleted_at: user.deleted_at,
            sessionId: request.sessionID,
        };

        const requestSessionData = {
            sessionId: request.sessionID,
            userId: user.user_id,
        };

        await userModel.updateUserSession(requestSessionData);

        return response.status(STATUS_CODES.OK).json({
            status: STATUS_CODES.OK,
            message: MESSAGES.USER.LOGIN_SUCCESS,
            data: responseData,
        });
    } catch (error) {
        console.error('Login error: ', error);

        let statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
        let message = MESSAGES.INTERNAL_SERVER_ERROR;

        switch (error.message) {
            case 'INVALID_EMAIL_OR_PASSWORD':
                statusCode = STATUS_CODES.NOT_AUTHORIZED;
                message = MESSAGES.USER.INVALID_EMAIL_OR_PASSWORD;
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
export const loginUser = async (request, response) => {
    try {
        if (!request.body.email)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.USER.INVALID_USER_EMAIL,
                data: null,
            });
        if (!request.body.password)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.USER.INVALID_USER_PASSWORD,
                data: null,
            });

        const { email, password } = request.body;

        const requestData = {
            email,
            password,
        };

        const responseData = await userModel.loginUser(requestData, response);

        if (!responseData || responseData === null) {
            return response.status(STATUS_CODES.NOT_AUTHORIZED).json({
                status: 401,
                message: MESSAGES.USER.INVALID_EMAIL_OR_PASSWORD,
                data: null,
            });
        }

        responseData.sessionId = request.sessionID;

        const requestSessionData = {
            sessionId: request.sessionID,
            userId: responseData.userId,
        };

        await userModel.updateUserSession(requestSessionData, response);

        return response.status(STATUS_CODES.OK).json({
            status: STATUS_CODES.OK,
            message: MESSAGES.USER.LOGIN_SUCCESS,
            data: responseData,
        });
    } catch (error) {
        console.log('Login error: ', error);
        return response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
            message: MESSAGES.INTERNAL_SERVER_ERROR,
            data: null,
        });
    }
};
*/

export const getUser = async (request, response) => {
    if (!request.params.user_id)
        return response.status(STATUS_CODES.BAD_REQUEST).json({
            status: STATUS_CODES.BAD_REQUEST,
            message: MESSAGES.USER.INVALID_USER_ID,
            data: null,
        });

    try {
        const userId = request.params.user_id;

        const requestData = {
            userId,
        };
        const responseData = await userModel.getUser(requestData, response);

        if (responseData === null || responseData.length === 0)
            throw new Error(MESSAGES.USER.NOT_FOUND_USER);

        const results = {
            userId: responseData.user_id,
            email: responseData.email,
            nickname: responseData.nickname,
            profileImagePath: responseData.file_path,
            sessionId: responseData.session_id,
            created_at: responseData.created_at,
            updated_at: responseData.updated_at,
            deleted_at: responseData.deleted_at,
        };

        return response.status(STATUS_CODES.OK).json(results);
    } catch (error) {
        console.error('getUser error: ', error);

        let statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
        let message = MESSAGES.INTERNAL_SERVER_ERROR;

        switch (error.message) {
            case MESSAGES.USER.NOT_FOUND_USER:
                statusCode = STATUS_CODES.NOT_FOUND;
                message = MESSAGES.USER.NOT_FOUND_USER;
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
export const getUser = async (request, response) => {
    try {
        if (!request.params.user_id)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.USER.INVALID_USER_ID,
                data: null,
            });
        const userId = request.params.user_id;

        const requestData = {
            userId,
        };
        const responseData = await userModel.getUser(requestData, response);

        if (responseData === null)
            return response.status(STATUS_CODES.NOT_FOUND).json({
                status: STATUS_CODES.NOT_FOUND,
                message: MESSAGES.USER.NOT_FOUND_USER,
                data: null,
            });

        return response.status(STATUS_CODES.OK).json(responseData);
    } catch (error) {
        console.log(error);
        return response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
            message: MESSAGES.INTERNAL_SERVER_ERROR,
            data: null,
        });
    }
};
*/

// 회원정보 수정
export const updateUser = async (request, response) => {
    if (!request.params.user_id)
        return response.status(STATUS_CODES.BAD_REQUEST).json({
            status: STATUS_CODES.BAD_REQUEST,
            message: MESSAGES.USER.INVALID_USER_ID,
            data: null,
        });
    if (!request.body.nickname)
        return response.status(STATUS_CODES.BAD_REQUEST).json({
            status: STATUS_CODES.BAD_REQUEST,
            message: MESSAGES.USER.INVALID_USER_NICKNAME,
            data: null,
        });

    try {
        const userId = request.params.user_id;
        const { nickname, profileImagePath } = request.body;

        const requestData = {
            userId,
            nickname,
            ...(profileImagePath !== undefined && { profileImagePath }),
        };

        const responseData = await userModel.updateUser(requestData, response);

        if (responseData === null)
            throw new Error(MESSAGES.USER.NOT_FOUND_USER);

        if (profileImagePath !== undefined) {
            const requestProfileImageData = {
                userId,
                profileImagePath,
            };

            await userModel.updateUserProfileImage(
                requestProfileImageData,
                response,
            );
        }

        return response.status(STATUS_CODES.CREATED).json({
            status: STATUS_CODES.CREATED,
            message: MESSAGES.USER.UPDATE_USER_SUCCESS,
            data: null,
        });
    } catch (error) {
        console.error(error.message);

        let statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
        let message = MESSAGES.INTERNAL_SERVER_ERROR;

        switch (error.message) {
            case MESSAGES.USER.NOT_FOUND_USER:
                statusCode = STATUS_CODES.NOT_FOUND;
                message = MESSAGES.USER.NOT_FOUND_USER;
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
export const updateUser = async (request, response) => {
    try {
        if (!request.params.user_id)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.USER.INVALID_USER_ID,
                data: null,
            });
        if (!request.body.nickname)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.USER.INVALID_USER_NICKNAME,
                data: null,
            });

        const userId = request.params.user_id;
        const { nickname, profileImagePath } = request.body;

        const requestData = {
            userId,
            nickname,
        };
        if (profileImagePath !== undefined)
            requestData.profileImagePath = profileImagePath;

        const responseData = await userModel.updateUser(requestData, response);

        if (responseData === null)
            return response.status(STATUS_CODES.NOT_FOUND).json({
                status: STATUS_CODES.NOT_FOUND,
                message: MESSAGES.USER.NOT_FOUND_USER,
                data: null,
            });

        return response.status(STATUS_CODES.CREATED).json({
            status: STATUS_CODES.CREATED,
            message: MESSAGES.USER.UPDATE_USER_SUCCESS,
            data: null,
        });
    } catch (error) {
        console.log(error);
        return response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
            message: MESSAGES.INTERNAL_SERVER_ERROR,
            data: null,
        });
    }
}; */

// 비밀번호 변경
export const changePassword = async (request, response) => {
    const userId = request.headers.userid;
    const { password } = request.body;

    if (!userId) {
        return response.status(STATUS_CODES.BAD_REQUEST).json({
            status: STATUS_CODES.BAD_REQUEST,
            message: MESSAGES.USER.INVALID_USER_ID,
            data: null,
        });
    }

    if (!password || !validPassword(password)) {
        return response.status(STATUS_CODES.BAD_REQUEST).json({
            status: STATUS_CODES.BAD_REQUEST,
            message: MESSAGES.USER.INVALID_USER_PASSWORD,
            data: null,
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, SALTROUNDS);
        const requestData = {
            userId,
            password: hashedPassword,
        };

        const responseData = await userModel.changePassword(requestData);

        if (responseData === null || responseData.affectedRows === 0)
            throw new Error(MESSAGES.USER.NOT_FOUND_USER);

        return response.status(STATUS_CODES.OK).json({
            status: STATUS_CODES.OK,
            message: MESSAGES.USER.CHANGE_PASSWORD_SUCCESS,
            data: null,
        });
    } catch (error) {
        console.error(error);

        let statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
        let message = MESSAGES.INTERNAL_SERVER_ERROR;

        switch (error.message) {
            case MESSAGES.USER.NOT_FOUND_USER:
                statusCode = STATUS_CODES.NOT_FOUND;
                message = MESSAGES.USER.NOT_FOUND_USER;
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
export const changePassword = async (request, response) => {
    try {
        if (!request.headers.userid)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.USER.INVALID_USER_ID,
                data: null,
            });

        const userId = request.headers.userid;
        const { password } = request.body;

        const passwordValid = validPassword(password);

        if (!password || !passwordValid) {
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.USER.INVALID_USER_PASSWORD,
                data: null,
            });
        }

        const hashedPassword = await bcrypt.hash(password, SALTROUNDS);
        const requestData = {
            userId,
            password: hashedPassword,
        };

        const responseData = await userModel.changePassword(
            requestData,
            response,
        );

        if (responseData === null) {
            return response.status(STATUS_CODES.NOT_FOUND).json({
                status: STATUS_CODES.NOT_FOUND,
                message: MESSAGES.USER.NOT_FOUND_USER,
                data: null,
            });
        }

        return response.status(STATUS_CODES.CREATED).json({
            status: STATUS_CODES.CREATED,
            message: MESSAGES.USER.CHANGE_PASSWORD_SUCCESS,
            data: null,
        });
    } catch (error) {
        console.log(error);
        return response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
            message: MESSAGES.INTERNAL_SERVER_ERROR,
            data: null,
        });
    }
}; */

// 회원탈퇴
/* export const softDeleteUser = async (request, response) => {
    try {
        if (!request.params.user_id)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.USER.INVALID_USER_ID,
                data: null,
            });

        const userId = request.params.user_id;

        const requestData = {
            userId,
        };
        const responseData = await userModel.softDeleteUser(
            requestData,
            response,
        );

        if (responseData === null)
            return response.status(STATUS_CODES.NOT_FOUND).json({
                status: STATUS_CODES.NOT_FOUND,
                message: MESSAGES.USER.NOT_FOUND_USER,
                data: null,
            });

        return response.status(STATUS_CODES.OK).json({
            status: STATUS_CODES.OK,
            message: MESSAGES.USER.DELETE_USER_SUCCESS,
            data: null,
        });
    } catch (error) {
        console.log(error);
        return response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
            message: MESSAGES.INTERNAL_SERVER_ERROR,
            data: null,
        });
    }
}; */
export const softDeleteUser = async (request, response) => {
    if (!request.params.user_id) {
        return response.status(STATUS_CODES.BAD_REQUEST).json({
            status: STATUS_CODES.BAD_REQUEST,
            message: MESSAGES.USER.INVALID_USER_ID,
            data: null,
        });
    }

    try {
        const userId = request.params.user_id;

        const requestData = {
            userId,
        };
        // 유저 존재 여부 확인
        const checkUser = await userModel.getUser(requestData);

        if (!checkUser || checkUser === null)
            throw new Error(MESSAGES.USER.NOT_FOUND_USER);

        // 유저 소프트 삭제
        await userModel.softDeleteUserById(userId);

        // 유저의 게시물 소프트 삭제
        await postModel.softDeletePostsByUserId(userId);

        return response.status(STATUS_CODES.OK).json({
            status: STATUS_CODES.OK,
            message: MESSAGES.USER.DELETE_USER_SUCCESS,
            data: null,
        });
    } catch (error) {
        console.error(error);

        let statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
        let message = MESSAGES.INTERNAL_SERVER_ERROR;

        switch (error.message) {
            case MESSAGES.USER.NOT_FOUND_USER:
                statusCode = STATUS_CODES.NOT_FOUND;
                message = MESSAGES.USER.NOT_FOUND_USER;
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

export const checkAuth = async (request, response) => {
    try {
        const userId = request.headers.userid;

        const requestData = {
            userId,
        };

        const userData = await userModel.getUser(requestData, response);

        if (userData === null || userData.length === 0)
            throw new Error(MESSAGES.USER.NOT_FOUND_USER);

        if (parseInt(userData.user_id, 10) !== parseInt(userId, 10))
            throw new Error(MESSAGES.NOT_AUTHORIZED);

        const results = {
            userId: userData.user_id,
            email: userData.email,
            nickname: userData.nickname,
            profileImagePath: userData.file_path,
            sessionId: userData.session_id,
            auth_status: true,
        };

        return response.status(STATUS_CODES.OK).json({
            status: STATUS_CODES.OK,
            message: null,
            data: results,
        });
    } catch (error) {
        console.error(error.message);

        let statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
        let message = MESSAGES.INTERNAL_SERVER_ERROR;

        switch (error.message) {
            case MESSAGES.USER.NOT_FOUND_USER:
                statusCode = STATUS_CODES.NOT_FOUND;
                message = MESSAGES.USER.NOT_FOUND_USER;
                break;
            case MESSAGES.NOT_AUTHORIZED:
                statusCode = STATUS_CODES.NOT_AUTHORIZED;
                message = MESSAGES.NOT_AUTHORIZED;
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
export const checkAuth = async (request, response) => {
    try {
        const userId = request.headers.userid;

        const requestData = {
            userId,
        };

        const userData = await userModel.getUser(requestData, response);

        if (userData === null)
            return response.status(STATUS_CODES.NOT_FOUND).json({
                status: STATUS_CODES.NOT_FOUND,
                message: MESSAGES.USER.NOT_FOUND_USER,
                data: null,
            });

        if (parseInt(userData.userId, 10) !== parseInt(userId, 10))
            return response.status(STATUS_CODES.NOT_AUTHORIZED).json({
                status: STATUS_CODES.NOT_AUTHORIZED,
                message: MESSAGES.NOT_AUTHORIZED,
                data: null,
            });

        return response.status(STATUS_CODES.OK).json({
            status: STATUS_CODES.OK,
            message: null,
            data: {
                userId,
                email: userData.email,
                nickname: userData.nickname,
                profileImagePath: userData.profileImagePath,
                sessionId: userData.sessionId,
                auth_status: true,
            },
        });
    } catch (error) {
        console.log(error);
        return response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
            message: MESSAGES.INTERNAL_SERVER_ERROR,
            data: null,
        });
    }
}; */

// 로그아웃

/*
legacy code
export const logoutUser = async (request, response) => {
    try {
        const userId = request.headers.userid;
        return request.session.destroy(async error => {
            if (error) {
                console.log(error);
                return response
                    .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
                    .json({
                        status: STATUS_CODES.INTERNAL_SERVER_ERROR,
                        message: MESSAGES.INTERNAL_SERVER_ERROR,
                        data: null,
                    });
            }

            try {
                const requestData = {
                    userId,
                };
                await userModel.destroyUserSession(requestData);
                return response.status(204).end();
            } catch (userSessionError) {
                console.log(userSessionError);
                return response
                    .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
                    .json({
                        status: STATUS_CODES.INTERNAL_SERVER_ERROR,
                        message: MESSAGES.INTERNAL_SERVER_ERROR,
                        data: null,
                    });
            }
        });
    } catch (logoutError) {
        console.log(logoutError);
        return response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
            message: MESSAGES.INTERNAL_SERVER_ERROR,
            data: null,
        });
    }
}; */
export const logoutUser = async (request, response) => {
    const userId = request.headers.userid;

    try {
        request.session.destroy(error => {
            if (error) {
                throw new Error('SESSION_DESTROY_ERROR');
            }
        });

        const requestData = { userId };
        await userModel.destroyUserSession(requestData);

        return response.status(204).end();
    } catch (error) {
        console.error('Logout error: ', error);

        const statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
        let message = MESSAGES.INTERNAL_SERVER_ERROR;

        switch (error.message) {
            case 'SESSION_DESTROY_ERROR':
                message = 'Failed to destroy session.';
                break;
            case 'USER_SESSION_DESTROY_ERROR':
                message = 'Failed to destroy user session.';
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

export const checkEmail = async (request, response) => {
    try {
        const { email } = request.query;

        const requestData = {
            email,
        };

        const responseData = await userModel.checkEmail(requestData, response);

        if (responseData === null || responseData.length === 0)
            return response.status(STATUS_CODES.OK).json({
                status: STATUS_CODES.OK,
                message: MESSAGES.USER.AVAILABLE_EMAIL,
                data: null,
            });

        return response.status(STATUS_CODES.BAD_REQUEST).json({
            status: STATUS_CODES.BAD_REQUEST,
            message: MESSAGES.USER.ALREADY_EXIST_EMAIL,
            data: null,
        });
    } catch (error) {
        console.log(error);

        return response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
            message: MESSAGES.INTERNAL_SERVER_ERROR,
            data: null,
        });
    }
};

export const checkNickname = async (request, response) => {
    try {
        const { nickname } = request.query;

        const requestData = {
            nickname,
        };

        const responseData = await userModel.checkNickname(
            requestData,
            response,
        );

        if (responseData === null)
            return response.status(STATUS_CODES.OK).json({
                status: STATUS_CODES.OK,
                message: MESSAGES.USER.AVAILABLE_NICKNAME,
                data: null,
            });

        return response.status(STATUS_CODES.BAD_REQUEST).json({
            status: STATUS_CODES.BAD_REQUEST,
            message: MESSAGES.USER.ALREADY_EXIST_NICKNAME,
            data: null,
        });
    } catch (error) {
        console.log(error);
        return response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
            message: MESSAGES.INTERNAL_SERVER_ERROR,
            data: null,
        });
    }
};
