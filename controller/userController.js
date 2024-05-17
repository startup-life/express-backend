import mysql from 'mysql2';
import bcrypt from 'bcrypt';
import * as userModel from '../model/userModel.js';
import { validEmail, validNickname, validPassword } from '../util/validUtil.js';
import { STATUS_CODES, MESSAGES } from '../util/responseConstants.js';

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
        if (request.body.profileImagePath === undefined)
            request.body.profileImagePath = null;

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

        const reqSignupData = {
            email: mysql.escape(email),
            password: mysql.escape(hashedPassword),
            nickname: mysql.escape(nickname),
            profileImagePath:
                profileImagePath === null
                    ? null
                    : mysql.escape(profileImagePath),
        };
        const resSignupData = await userModel.signUpUser(
            reqSignupData,
            response,
        );

        if (profileImagePath !== null) {
            const reqProfileImageData = {
                userId: resSignupData,
                profileImagePath: mysql.escape(profileImagePath),
            };

            const resProfileImageData = await userModel.uploadProfileImage(
                reqProfileImageData,
                response,
            );
            reqSignupData.file_id = resProfileImageData.insertId;
        }

        return response.status(STATUS_CODES.CREATED).json({
            status: STATUS_CODES.CREATED,
            message: MESSAGES.USER.SIGNUP_SUCCESS,
            data: {
                userId: resSignupData.insertId,
                profile_image_id: reqSignupData.file_id,
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
};

// 프로필 사진 업로드
export const uploadProfileImage = async (request, response) => {
    try {
        if (request.body.profileImage === undefined)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: 'invalid_profile_image',
                data: null,
            });
        if (!request.params.userId)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.USER.INVALID_USER_ID,
                data: null,
            });

        const { userId } = request.params;
        const { profileImage } = request.body;

        const requestData = {
            userId: mysql.escape(userId),
            profileImage: mysql.escape(profileImage),
        };

        const responseData = await userModel.uploadProfileImage(
            requestData,
            response,
        );

        if (responseData === null)
            return response.status(STATUS_CODES.NOT_FOUND).json({
                status: STATUS_CODES.NOT_FOUND,
                message: MESSAGES.USER.NOT_FOUND_USER,
                data: null,
            });

        return response.status(STATUS_CODES.CREATED).json({
            status: STATUS_CODES.CREATED,
            message: MESSAGES.FILE.FILE_UPLOAD_SUCCESS,
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

// 로그인
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
            email: mysql.escape(email),
            password: mysql.escape(password),
        };
        const responseData = await userModel.loginUser(requestData, response);

        if (!responseData || responseData === null) {
            return response.status(401).json({
                status: 401,
                message: MESSAGES.USER.INVALID_EMAIL_OR_PASSWORD,
                data: null,
            });
        }

        request.session.userId = responseData.userId;
        responseData.auth_token = request.sessionID;

        const reqSessionData = {
            session: mysql.escape(request.sessionID),
            userId: mysql.escape(responseData.userId),
        };

        await userModel.updateUserSession(reqSessionData, response);

        return response.status(STATUS_CODES.OK).json({
            status: STATUS_CODES.OK,
            message: MESSAGES.USER.LOGIN_SUCCESS,
            data: responseData,
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

// 유저 정보 가져오기
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
            userId: mysql.escape(userId),
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

// 회원정보 수정
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
        console.log(profileImagePath);

        const requestData = {
            userId: mysql.escape(userId),
            nickname: mysql.escape(nickname),
        };
        if (profileImagePath !== undefined)
            requestData.profileImagePath = mysql.escape(profileImagePath);

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
};

// 비밀번호 변경
export const changePassword = async (request, response) => {
    try {
        if (!request.params.user_id)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.USER.INVALID_USER_ID,
                data: null,
            });

        const userId = request.params.user_id;
        const { password } = request.body;

        // 8자 이상, 특수문자 포함
        const passwordRegex =
            /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,16}$/;

        if (!password || !passwordRegex.test(password)) {
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.USER.INVALID_USER_PASSWORD,
                data: null,
            });
        }

        const hashedPassword = await bcrypt.hash(password, SALTROUNDS);
        const requestData = {
            userId: mysql.escape(userId),
            password: mysql.escape(hashedPassword),
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
};

// 회원탈퇴
export const softDeleteUser = async (request, response) => {
    try {
        if (!request.params.user_id)
            return response.status(STATUS_CODES.BAD_REQUEST).json({
                status: STATUS_CODES.BAD_REQUEST,
                message: MESSAGES.USER.INVALID_USER_ID,
                data: null,
            });

        const userId = request.params.user_id;

        const requestData = {
            userId: mysql.escape(userId),
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
};

export const checkAuth = async (request, response) => {
    try {
        const userId = request.headers.userid;

        const requestData = {
            userId: mysql.escape(userId),
        };

        const userData = await userModel.getUser(requestData, response);

        if (userData === null)
            return response.status(STATUS_CODES.NOT_FOUND).json({
                status: STATUS_CODES.NOT_FOUND,
                message: MESSAGES.USER.NOT_FOUND_USER,
                data: null,
            });

        console.log(userData);

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
                profileImagePath: userData.profile_image,
                auth_token: userData.session_id,
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
};

// 로그아웃
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
};
/*
legacy code

export const logoutUser = async (request, response) => {
    try {
        const userId = request.headers.userid;
        request.session.destroy(err => {
            if (err) {
                console.log(err);
                return response
                    .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
                    .json({
                        status: STATUS_CODES.INTERNAL_SERVER_ERROR,
                        message: MESSAGES.INTERNAL_SERVER_ERROR,
                        data: null,
                    });
            }

            const requestData = {
                userId,
            };
            userModel.destroyUserSession(requestData, response);

            return response.status(204).end();
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
 */

export const checkEmail = async (request, response) => {
    try {
        const { email } = request.query;

        const requestData = {
            email: mysql.escape(email),
        };

        const responseData = await userModel.checkEmail(requestData, response);

        if (responseData === null)
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
            nickname: mysql.escape(nickname),
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
