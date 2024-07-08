const STATUS_CODE = {
    OK: 200,
    CREATED: 201,
    END: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
};

const STATUS_MESSAGE = {
    REQUIRED_EMAIL: 'required_email',
    REQUIRED_PASSWORD: 'required_password',
    REQUIRED_AUTHORIZATION: 'required_authorization',

    INVALID_EMAIL_OR_PASSWORD: 'invalid_email_or_password',
    INVALID_EMAIL: 'invalid_email',
    INVALID_NICKNAME: 'invalid_nickname',
    INVALID_PASSWORD: 'invalid_password',
    INVALID_USER_ID: 'invalid_user_id',

    ALREADY_EXIST_EMAIL: 'already_exist_email',
    NOT_FOUND_USER: 'not_found_user',

    AVAILVABLE_EMAIL: 'available_email',
    AVAILABLE_NICKNAME: 'available_nickname',

    SIGNUP_FAILED: 'signup_failed',
    UPDATE_PROFILE_IMAGE_FAILED: 'update_profile_image_failed',

    LOGIN_SUCCESS: 'login_success',
    SIGNUP_SUCCESS: 'signup_success',
    UPDATE_USER_DATA_SUCCESS: 'update_user_data_success',
    CHANGE_USER_PASSWORD_SUCCESS: 'change_user_password_success',
    DELETE_USER_DATA_SUCCESS: 'delete_user_data_success',

    INTERNAL_SERVER_ERROR: 'internal_server_error',
};

module.exports = {
    STATUS_CODE,
    STATUS_MESSAGE,
};
