const STATUS_CODE = {
    OK: 200,
    CREATED: 201,
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
    INVALID_EMAIL_OR_PASSWORD: 'invalid_email_or_password',
    LOGIN_SUCCESS: 'login_success',
    INTERNAL_SERVER_ERROR: 'internal_server_error',
};

module.exports = {
    STATUS_CODE,
    STATUS_MESSAGE,
};
