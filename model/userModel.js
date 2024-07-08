const bcrypt = require('bcrypt');
const dbConnect = require('../database/index.js');

// 로그인
exports.loginUser = async (requestData, response) => {
    const { email, password, sessionId } = requestData;

    const sql = `SELECT * FROM user_table WHERE email = ? AND deleted_at IS NULL;`;
    const results = await dbConnect.query(sql, [email], response);

    if (!results[0] || results[0] === 'undefined' || results[0] === undefined)
        return null;

    const match = await bcrypt.compare(password, results[0].password);
    if (!match) return null;

    if (results[0].file_id !== null) {
        const profileSql = `SELECT file_path FROM file_table WHERE file_id = ? AND deleted_at IS NULL AND file_category = 1;`;
        const profileResults = await dbConnect.query(
            profileSql,
            [results[0].file_id],
            response,
        );
        results[0].profileImagePath = profileResults[0].file_path;
    } else {
        results[0].profileImagePath = '/public/image/profile/default.png';
    }

    const user = {
        userId: results[0].user_id,
        email: results[0].email,
        nickname: results[0].nickname,
        profileImagePath: results[0].profile_image_path,
        sessionId,
        created_at: results[0].created_at,
        updated_at: results[0].updated_at,
        deleted_at: results[0].deleted_at,
    };

    // 세션 업데이트 로직
    const sessionSql = `UPDATE user_table SET session_id = ? WHERE user_id = ?;`;
    await dbConnect.query(sessionSql, [sessionId, user.userId]);

    return user;
};

// 회원가입
exports.signUpUser = async requestData => {
    const { email, password, nickname, profileImagePath } = requestData;

    const checkEmailSql = `SELECT email FROM user_table WHERE email = ?;`;
    const checkEmailResults = await dbConnect.query(checkEmailSql, [email]);

    if (checkEmailResults.length !== 0) return 'already_exist_email';

    const insertUserSql = `
    INSERT INTO user_table (email, password, nickname)
    VALUES (?, ?, ?);
    `;
    const userResults = await dbConnect.query(insertUserSql, [
        email,
        password,
        nickname,
    ]);

    if (!userResults.insertId) return null;

    let profileImageId = null;
    if (profileImagePath) {
        const insertFileSql = `
        INSERT INTO file_table (user_id, file_path, file_category)
        VALUES (?, ?, 1);
        `;
        const fileResults = await dbConnect.query(insertFileSql, [
            userResults.insertId,
            profileImagePath,
        ]);

        if (fileResults.insertId) {
            profileImageId = fileResults.insertId;

            const updateUserSql = `
            UPDATE user_table
            SET file_id = ?
            WHERE user_id = ?;
            `;
            await dbConnect.query(updateUserSql, [
                profileImageId,
                userResults.insertId,
            ]);
        }
    }

    return {
        userId: userResults.insertId,
        profileImageId: profileImageId,
    };
};

exports.getUser = async (requestData, response) => {
    const { userId } = requestData;

    /**
     * LEFT JOIN
     * - LEFT JOIN은 왼쪽 테이블을 기준으로 오른쪽 테이블을 연결하는 방식이다.
     *
     * COALESCE
     * - COALESCE는 NULL을 다른 값으로 대체하는 함수이다.
     * - COALESCE(값1, 값2, 값3, ...);
     * - 값1이 NULL이 아니면 값1을 반환하고, NULL이면 값2를 반환한다.
     */
    const sql = `
    SELECT user_table.*, COALESCE(file_table.file_path, '/public/image/profile/default.jpg') AS file_path
    FROM user_table
    LEFT JOIN file_table ON user_table.file_id = file_table.file_id
    WHERE user_table.user_id = ${userId} AND user_table.deleted_at IS NULL;
    `;
    const userData = await dbConnect.query(sql, response);

    const results = {
        userId: userData[0].user_id,
        email: userData[0].email,
        nickname: userData[0].nickname,
        profile_image: userData[0].file_path,
        created_at: userData[0].created_at,
        updated_at: userData[0].updated_at,
        deleted_at: userData[0].deleted_at,
    };
    return results;
};

// 회원정보 수정
exports.updateUser = async (requestData, response) => {
    const { userId, nickname, profileImagePath } = requestData;
    console.log(profileImagePath);
    const updateUserSql = `
    UPDATE user_table
    SET nickname = ${nickname}
    WHERE user_id = ${userId} AND deleted_at IS NULL;
    `;
    const updateUserResults = await dbConnect.query(updateUserSql, response);

    if (!updateUserResults) return null;

    if (profileImagePath === undefined) return updateUserResults;

    const profileImageSql = `
    INSERT INTO file_table
    (user_id, file_path, file_category)
    VALUES (${userId}, ${profileImagePath}, 1);
    `;
    const profileImageResults = await dbConnect.query(
        profileImageSql,
        response,
    );

    const userProfileSql = `
    UPDATE user_table
    SET file_id = ${profileImageResults.insertId}
    WHERE user_id = ${userId} AND deleted_at IS NULL;
    `;
    const userProfileResults = await dbConnect.query(userProfileSql, response);

    return userProfileResults;
};

// 비밀번호 변경
exports.changePassword = async (requestData, response) => {
    const { userId, password } = requestData;

    const sql = `
    UPDATE user_table
    SET password = ${password}
    WHERE user_id = ${userId};
    `;
    const results = await dbConnect.query(sql, response);

    if (!results) return null;

    return results;
};

// 회원탈퇴
exports.softDeleteUser = async (requestData, response) => {
    const { userId } = requestData;
    let sql = `SELECT * FROM user_table WHERE user_id = ${userId} AND deleted_at IS NULL;`;
    let results = await dbConnect.query(sql, response);

    if (!results) return null;

    sql = `UPDATE user_table SET deleted_at = now() WHERE user_id = ${userId};`;
    results = await dbConnect.query(sql, response);

    return results[0];
};

exports.checkEmail = async (requestData, response) => {
    const { email } = requestData;

    const sql = `SELECT email FROM user_table WHERE email = ${email};`;
    const results = await dbConnect.query(sql, response);

    if (!results || results.length === 0) return null;

    return results;
};

exports.checkNickname = async (requestData, response) => {
    const { nickname } = requestData;

    const sql = `SELECT nickname FROM user_table WHERE nickname = ${nickname};`;
    const results = await dbConnect.query(sql, response);

    if (!results || results.length === 0) return null;

    return results;
};

exports.updateUserSession = async (requestData, response) => {
    const { userId, session } = requestData;

    const sql = `
    UPDATE user_table
    SET session_id = ${session}
    WHERE user_id = ${userId};
    `;
    const results = await dbConnect.query(sql, response);

    if (!results) return null;

    return results;
};

exports.destroyUserSession = async (requestData, response) => {
    const { userId } = requestData;

    const sql = `
    UPDATE user_table
    SET session_id = NULL
    WHERE user_id = ${userId} AND session_id IS NOT NULL;
    `;

    const results = await dbConnect.query(sql, response);

    if (!results) {
        return null;
    }

    return results;
};
