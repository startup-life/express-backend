const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const userModel = require('../model/userModel.js');
const {
    validEmail,
    validNickname,
    validPassword,
} = require('../util/validUtil.js');
const {
    STATUS_CODE,
    STATUS_MESSAGE,
} = require('../util/constant/httpStatusCode.js');

const SALT_ROUNDS = 10;

// 로그인
exports.loginUser = async (request, response, next) => {
    try {
        const { email, password } = request.body;

        if (!email) {
            const error = new Error(STATUS_MESSAGE.REQUIRED_EMAIL);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }
        if (!password) {
            const error = new Error(STATUS_MESSAGE.REQUIRED_PASSWORD);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }

        const requestData = {
            email,
            password,
            sessionId: request.sessionID,
        };
        const responseData = await userModel.loginUser(requestData, response);

        if (!responseData || responseData === null) {
            const error = new Error(STATUS_MESSAGE.INVALID_EMAIL_OR_PASSWORD);
            error.status = STATUS_CODE.UNAUTHORIZED;
            throw error;
        }
        return response.status(200).json({
            status: STATUS_CODE.OK,
            message: STATUS_MESSAGE.LOGIN_SUCCESS,
            data: responseData,
        });
    } catch (error) {
        return next(error);
    }
};

// 회원가입
exports.signupUser = async (request, response, next) => {
    try {
        const { email, password, nickname, profileImagePath } = request.body;

        if (!email || !validEmail(email)) {
            const error = new Error(STATUS_MESSAGE.INVALID_EMAIL);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }
        if (!nickname || !validNickname(nickname)) {
            const error = new Error(STATUS_MESSAGE.INVALID_NICKNAME);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }
        if (!password || !validPassword(password)) {
            const error = new Error(STATUS_MESSAGE.INVALID_PASSWORD);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const reqSignupData = {
            email,
            password: hashedPassword,
            nickname,
            profileImagePath: profileImagePath || null,
        };

        const resSignupData = await userModel.signUpUser(reqSignupData);

        if (resSignupData === 'already_exist_email') {
            const error = new Error(STATUS_MESSAGE.ALREADY_EXIST_EMAIL);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }

        if (resSignupData === null) {
            const error = new Error(STATUS_MESSAGE.SIGNUP_FAILED);
            error.status = STATUS_CODE.INTERNAL_SERVER_ERROR;
            throw error;
        }

        return response.status(201).json({
            status: STATUS_CODE.CREATED,
            message: STATUS_MESSAGE.SIGNUP_SUCCESS,
            data: resSignupData,
        });
    } catch (error) {
        return next(error);
    }
};

// 유저 정보 가져오기
exports.getUser = async (request, response, next) => {
    try {
        const userId = request.params.user_id;

        if (!userId) {
            const error = new Error(STATUS_MESSAGE.INVALID_USER_ID);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }

        const requestData = {
            userId, // mysql.escape 제거, 모델에서 처리
        };
        const responseData = await userModel.getUser(requestData);

        if (responseData === null) {
            const error = new Error(STATUS_MESSAGE.NOT_FOUND_USER);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        return response.status(200).json({
            status: 200,
            message: null,
            data: responseData,
        });
    } catch (error) {
        return next(error);
    }
};

// 회원정보 수정
exports.updateUser = async (request, response, next) => {
    try {
        const userId = request.params.user_id;
        const { nickname, profileImagePath } = request.body;

        if (!userId) {
            const error = new Error(STATUS_MESSAGE.INVALID_USER_ID);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }
        if (!nickname) {
            const error = new Error(STATUS_MESSAGE.INVALID_NICKNAME);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }

        const requestData = {
            userId,
            nickname,
            profileImagePath,
        };
        const responseData = await userModel.updateUser(requestData);

        if (responseData === null) {
            const error = new Error(STATUS_MESSAGE.NOT_FOUND_USER);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        if (responseData === STATUS_MESSAGE.UPDATE_PROFILE_IMAGE_FAILED) {
            const error = new Error(STATUS_MESSAGE.UPDATE_PROFILE_IMAGE_FAILED);
            error.status = STATUS_CODE.INTERNAL_SERVER_ERROR;
            throw error;
        }

        return response.status(STATUS_CODE.CREATED).json({
            status: STATUS_CODE.CREATED,
            message: STATUS_MESSAGE.UPDATE_USER_DATA_SUCCESS,
            data: null,
        });
    } catch (error) {
        return next(error);
    }
};
/*exports.updateUser = async (request, response) => {
    try {
        if (!request.params.user_id)
            return response.status(400).json({
                status: 400,
                message: 'invalid_user_id',
                data: null,
            });
        if (!request.body.nickname)
            return response.status(400).json({
                status: 400,
                message: 'invalid_nickname',
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

        const resData = await userModel.updateUser(requestData, response);

        if (resData === null)
            return response.status(404).json({
                status: 404,
                message: 'not_found_user',
                data: null,
            });

        return response.status(201).json({
            status: 201,
            message: 'update_user_data_success',
            data: null,
        });
    } catch (error) {
        console.log(error);
        return response.status(500).json({
            status: 500,
            message: 'Internal Server Error',
            data: null,
        });
    }
};*/

// 로그인 상태 체크
exports.checkAuth = async (request, response, next) => {
    try {
        const userId = request.headers.userid;

        if (!userId) {
            const error = new Error(STATUS_MESSAGE.INVALID_USER_ID);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }

        const requestData = {
            userId,
        };

        const userData = await userModel.getUser(requestData);

        if (!userData) {
            const error = new Error(STATUS_MESSAGE.NOT_FOUND_USER);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        if (parseInt(userData.userId, 10) !== parseInt(userId, 10)) {
            const error = new Error(STATUS_MESSAGE.REQUIRED_AUTHORIZATION);
            error.status = STATUS_CODE.UNAUTHORIZED;
            throw error;
        }

        return response.status(STATUS_CODE.OK).json({
            status: STATUS_CODE.OK,
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
        return next(error);
    }
};

// 비밀번호 변경
exports.changePassword = async (request, response, next) => {
    try {
        const userId = request.params.user_id;
        const { password } = request.body;

        if (!userId) {
            const error = new Error(STATUS_MESSAGE.INVALID_USER_ID);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }

        if (!password || !validPassword(password)) {
            const error = new Error(STATUS_MESSAGE.INVALID_PASSWORD);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const requestData = {
            userId,
            password: hashedPassword,
        };
        const responseData = await userModel.changePassword(requestData);

        if (!responseData) {
            const error = new Error(STATUS_MESSAGE.NOT_FOUND_USER);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        return response.status(STATUS_CODE.CREATED).json({
            status: STATUS_CODE.CREATED,
            message: STATUS_MESSAGE.CHANGE_USER_PASSWORD_SUCCESS,
            data: null,
        });
    } catch (error) {
        return next(error);
    }
};
/*exports.changePassword = async (request, response) => {
    try {
        if (!request.params.user_id)
            return response.status(400).json({
                status: 400,
                message: 'invalid_user_id',
                data: null,
            });

        const userId = request.params.user_id;
        const { password } = request.body;

        // 8자 이상, 특수문자 포함
        const passwordRegex =
            /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,16}$/;

        if (!password || !passwordRegex.test(password)) {
            return response.status(400).json({
                status: 400,
                message: 'invalid_password',
                data: null,
            });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const requestData = {
            userId: mysql.escape(userId),
            password: mysql.escape(hashedPassword),
        };

        const resData = await userModel.changePassword(requestData, response);
        if (resData === null) {
            return response.status(404).json({
                status: 404,
                message: 'not_found_user',
                data: null,
            });
        }

        return response.status(201).json({
            status: 201,
            message: 'change_user_password_success',
            data: null,
        });
    } catch (error) {
        console.log(error);
        return response.status(500).json({
            status: 500,
            message: 'Internal Server Error',
            data: null,
        });
    }
};*/

// 회원탈퇴
exports.softDeleteUser = async (request, response, next) => {
    try {
        const userId = request.params.user_id;

        if (!userId) {
            const error = new Error(STATUS_MESSAGE.INVALID_USER_ID);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }

        const requestData = {
            userId,
        };
        const responseData = await userModel.softDeleteUser(requestData);

        if (responseData === null) {
            const error = new Error(STATUS_MESSAGE.NOT_FOUND_USER);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        return response.status(STATUS_CODE.OK).json({
            status: STATUS_CODE.OK,
            message: STATUS_MESSAGE.DELETE_USER_DATA_SUCCESS,
            data: null,
        });
    } catch (error) {
        return next(error);
    }
};
/*exports.softDeleteUser = async (request, response) => {
    try {
        if (!request.params.user_id)
            return response.status(400).json({
                status: 400,
                message: 'invalid_user_id',
                data: null,
            });

        const userId = request.params.user_id;

        const requestData = {
            userId: mysql.escape(userId),
        };
        const resData = await userModel.softDeleteUser(requestData, response);

        if (resData === null)
            return response.status(404).json({
                status: 404,
                message: 'not_found_user',
                data: null,
            });

        return response.status(200).json({
            status: 200,
            message: 'delete_user_data_success',
            data: null,
        });
    } catch (error) {
        console.log(error);
        return response.status(500).json({
            status: 500,
            message: 'Internal Server Error',
            data: null,
        });
    }
};*/

// 로그아웃
exports.logoutUser = async (request, response, next) => {
    try {
        const userId = request.headers.userid;

        request.session.destroy(async error => {
            if (error) {
                return next(error);
            }

            try {
                const requestData = {
                    userId,
                };
                await userModel.destroyUserSession(requestData, response);

                return response.status(STATUS_CODE.END).end();
            } catch (error) {
                return next(error);
            }
        });
    } catch (error) {
        return next(error);
    }
};

exports.checkEmail = async (request, response, next) => {
    try {
        const { email } = request.query;

        if (!email) {
            const error = new Error(STATUS_MESSAGE.INVALID_EMAIL);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }

        const requestData = { email };

        const resData = await userModel.checkEmail(requestData);

        if (resData === null) {
            return response.status(STATUS_CODE.OK).json({
                status: STATUS_CODE.OK,
                message: STATUS_MESSAGE.AVAILVABLE_EMAIL,
                data: null,
            });
        }

        const error = new Error(STATUS_MESSAGE.ALREADY_EXIST_EMAIL);
        error.status = STATUS_CODE.BAD_REQUEST;
        throw error;
    } catch (error) {
        return next(error);
    }
};
/*exports.checkEmail = async (request, response, next) => {
    try {
        const { email } = request.query;

        const requestData = {
            email: mysql.escape(email),
        };

        const resData = await userModel.checkEmail(requestData, response);

        if (resData === null)
            return response.status(200).json({
                status: 200,
                message: 'available_email',
                data: null,
            });

        return response.status(400).json({
            status: 400,
            message: 'already_exist_email',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};*/

// 닉네임 체크
exports.checkNickname = async (request, response, next) => {
    try {
        const { nickname } = request.query;

        if (!nickname) {
            const error = new Error(STATUS_MESSAGE.INVALID_NICKNAME);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }

        const requestData = { nickname };

        const responseData = await userModel.checkNickname(requestData);

        if (!responseData) {
            return response.status(STATUS_CODE.OK).json({
                status: STATUS_CODE.OK,
                message: STATUS_MESSAGE.AVAILABLE_NICKNAME,
                data: null,
            });
        }

        const error = new Error(STATUS_MESSAGE.ALREADY_EXIST_EMAIL);
        error.status = STATUS_CODE.BAD_REQUEST;
        throw error;
    } catch (error) {
        return next(error);
    }
};
/*exports.checkNickname = async (request, response) => {
    const { nickname } = request.query;

    const requestData = {
        nickname: mysql.escape(nickname),
    };

    const resData = await userModel.checkNickname(requestData, response);

    if (resData === null)
        return response.status(200).json({
            status: 200,
            message: 'available_nickname',
            data: null,
        });

    return response.status(400).json({
        status: 400,
        message: 'already_exist_nickname',
        data: null,
    });
};*/
