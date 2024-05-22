import bcrypt from 'bcrypt';
import * as dbConnect from '../database/index.js';

// 회원가입
export const signUpUser = async requestData => {
    try {
        const { email, password, nickname } = requestData;

        const checkEmailSql = 'SELECT email FROM user_table WHERE email = ?';
        const checkEmailResults = await dbConnect.query(checkEmailSql, [email]);

        if (checkEmailResults.length !== 0) return null;

        const sql = `
        INSERT INTO user_table (email, password, nickname)
        VALUES (?, ?, ?)
        `;
        const results = await dbConnect.query(sql, [email, password, nickname]);

        return results.insertId;
    } catch (error) {
        console.log('Error: [M]signupUser: ', error);
        throw new Error('Database error');
    }
};

export const uploadProfileImage = async requestData => {
    const { userId, profileImagePath } = requestData;

    const profileImagePathSql = `
    INSERT INTO file_table
    (user_id, file_path, file_category)
    VALUES (?, ?, 1);
    `;
    const profileResults = await dbConnect.query(profileImagePathSql, [
        userId,
        profileImagePath,
    ]);

    const userProfileSql = `
    UPDATE user_table
    SET file_id = ?
    WHERE user_id = ?;
    `;

    const userProfileResults = await dbConnect.query(userProfileSql, [
        profileResults.insertId,
        userId,
    ]);
    return userProfileResults.insertId;
};

// 로그인
export const loginUser = async requestData => {
    const { email, password } = requestData;

    const sql =
        'SELECT * FROM user_table WHERE email = ? AND deleted_at IS NULL';
    const results = await dbConnect.query(sql, [email]);

    if (!results[0] || results[0] === 'undefined' || results[0] === undefined)
        return null;

    // 비밀번호 검증
    const match = await bcrypt.compare(password, results[0].password);

    if (!match) return null;

    if (results[0].file_id !== null) {
        const profileSql =
            'SELECT file_path FROM file_table WHERE file_id = ? AND deleted_at IS NULL AND file_category = 1';
        const profileResults = await dbConnect.query(profileSql, [
            results[0].file_id,
        ]);
        results[0].profileImagePath = profileResults[0].file_path;
    } else {
        results[0].profileImagePath = '/public/image/profile/default.png';
    }

    const user = {
        userId: results[0].user_id,
        email: results[0].email,
        nickname: results[0].nickname,
        profileImagePath: results[0].profileImagePath,
        created_at: results[0].created_at,
        updated_at: results[0].updated_at,
        deleted_at: results[0].deleted_at,
    };

    return user;
};

export const getUser = async requestData => {
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
    WHERE user_table.user_id = ? AND user_table.deleted_at IS NULL;
    `;
    const userData = await dbConnect.query(sql, [userId]);

    if (userData.length === 0) {
        throw new Error('User not found');
    }

    const results = {
        userId: userData[0].user_id,
        email: userData[0].email,
        nickname: userData[0].nickname,
        profileImagePath: userData[0].file_path,
        sessionId: userData[0].session_id,
        created_at: userData[0].created_at,
        updated_at: userData[0].updated_at,
        deleted_at: userData[0].deleted_at,
    };
    return results;
};

// 회원정보 수정
export const updateUser = async (requestData, response) => {
    const { userId, nickname, profileImagePath } = requestData;

    const updateUserSql = `
    UPDATE user_table
    SET nickname = ?
    WHERE user_id = ? AND deleted_at IS NULL;
    `;
    const updateUserResults = await dbConnect.query(updateUserSql, [
        nickname,
        userId,
    ]);

    if (!updateUserResults) return null;

    if (profileImagePath === undefined) return updateUserResults;

    const profileImageSql = `
    INSERT INTO file_table
    (user_id, file_path, file_category)
    VALUES (?, ?, 1);
    `;
    const profileImageResults = await dbConnect.query(profileImageSql, [
        userId,
        profileImagePath,
    ]);

    const userProfileSql = `
    UPDATE user_table
    SET file_id = ?
    WHERE user_id = ? AND deleted_at IS NULL;
    `;
    const userProfileResults = await dbConnect.query(
        userProfileSql,
        [parseInt(profileImageResults.insertId, 10), userId],
        response,
    );

    return userProfileResults;
};

// 비밀번호 변경
export const changePassword = async requestData => {
    const { userId, password } = requestData;

    const sql = `
    UPDATE user_table
    SET password = ?
    WHERE user_id = ?;
    `;
    const results = await dbConnect.query(sql, [password, userId]);

    if (!results) return null;

    return results;
};

// 회원탈퇴
export const softDeleteUser = async requestData => {
    const { userId } = requestData;
    let sql = `SELECT * FROM user_table WHERE user_id = ? AND deleted_at IS NULL;`;
    let results = await dbConnect.query(sql, [userId]);

    if (!results) return null;

    sql = `UPDATE user_table SET deleted_at = now() WHERE user_id = ?;`;
    results = await dbConnect.query(sql, [userId]);

    sql = `UPDATE post_table SET deleted_at = now() WHERE user_id = ?;`;
    await dbConnect.query(sql, [userId]);

    return results[0];
};

export const updateUserSession = async requestData => {
    const { userId, sessionId } = requestData;

    const sql = `
    UPDATE user_table
    SET session_id = ?
    WHERE user_id = ?;
    `;
    const results = await dbConnect.query(sql, [sessionId, userId]);

    if (!results) return null;

    return results;
};

export const destroyUserSession = async requestData => {
    const { userId } = requestData;

    const sql = `
    UPDATE user_table
    SET session_id = NULL
    WHERE user_id = ? AND session_id IS NOT NULL;
    `;

    const results = await dbConnect.query(sql, [userId]);

    if (!results) {
        return null;
    }

    return results;
};

export const checkEmail = async requestData => {
    const { email } = requestData;

    const sql = `SELECT email FROM user_table WHERE email = ?;`;
    const results = await dbConnect.query(sql, [email]);

    if (!results || results.length === 0) return null;

    return results;
};

export const checkNickname = async requestData => {
    const { nickname } = requestData;

    const sql = `SELECT nickname FROM user_table WHERE nickname = ?;`;
    const results = await dbConnect.query(sql, [nickname]);

    if (!results || results.length === 0) return null;

    return results;
};
