import * as dbConnect from '../database/index.js';

/**
 * 게시글 목록 조회
 * 게시글 상세 조회
 * 게시글 작성
 * 파일 업로드
 */

// 게시글 작성 (일반 게시글)
export const writePlainPost = async requestData => {
    const { userId, postTitle, postContent } = requestData;

    const nicknameSql = `
    SELECT nickname FROM user_table
    WHERE user_id = ? AND deleted_at IS NULL;
    `;
    const nicknameResults = await dbConnect.query(nicknameSql, [userId]);

    const writePostSql = `
    INSERT INTO post_table
    (user_id, nickname, post_title, post_content)
    VALUES (?, ?, ?, ?);
    `;

    const writePostResults = await dbConnect.query(writePostSql, [
        userId,
        nicknameResults[0].nickname,
        postTitle,
        postContent,
    ]);
    return writePostResults;
};

// 파일 업로드
export const uploadFile = async requestData => {
    const { userId, postId, filePath } = requestData;

    const postFilePathSql = `
    INSERT INTO file_table
    (user_id, post_id, file_path, file_category)
    VALUES (?, ?, ?, 2);
    `;

    const postFileResults = await dbConnect.query(postFilePathSql, [
        userId,
        postId,
        filePath,
    ]);

    const updatePostSql = `
    UPDATE post_table
    SET file_id = ?
    WHERE post_id = ?;
    `;

    const updatePostResults = await dbConnect.query(updatePostSql, [
        postFileResults.insertId,
        postId,
    ]);
    return updatePostResults.insertId;
};

// 게시글 목록 조회
export const getPosts = async requestData => {
    const { offset, limit } = requestData;

    const sql = `
    SELECT
        post_table.post_id,
        post_table.post_title,
        post_table.post_content,
        post_table.file_id,
        post_table.user_id,
        post_table.nickname,
        post_table.created_at,
        post_table.updated_at,
        post_table.deleted_at,
        CASE
            WHEN post_table.\`like\` >= 1000000 THEN CONCAT(ROUND(post_table.\`like\` / 1000000, 1), 'M')
            WHEN post_table.\`like\` >= 1000 THEN CONCAT(ROUND(post_table.\`like\` / 1000, 1), 'K')
            ELSE post_table.\`like\`
        END as \`like\`,
        CASE
            WHEN post_table.comment_count >= 1000000 THEN CONCAT(ROUND(post_table.comment_count / 1000000, 1), 'M')
            WHEN post_table.comment_count >= 1000 THEN CONCAT(ROUND(post_table.comment_count / 1000, 1), 'K')
            ELSE post_table.comment_count
        END as comment_count,
        CASE
            WHEN post_table.hits >= 1000000 THEN CONCAT(ROUND(post_table.hits / 1000000, 1), 'M')
            WHEN post_table.hits >= 1000 THEN CONCAT(ROUND(post_table.hits / 1000, 1), 'K')
            ELSE post_table.hits
        END as hits,
        COALESCE(file_table.file_path, '/public/image/profile/default.jpg') AS profileImagePath
    FROM post_table
            LEFT JOIN user_table ON post_table.user_id = user_table.user_id
            LEFT JOIN file_table ON user_table.file_id = file_table.file_id
    WHERE post_table.deleted_at IS NULL
    ORDER BY post_table.created_at DESC
    LIMIT ? OFFSET ?;
    `;
    const results = await dbConnect.query(sql, [limit, offset]);

    if (!results) return null;
    return results;
};

// 게시글 상세 조회
const getPostDetails = async postId => {
    const sql = `
    SELECT 
        post_table.post_id,
        post_table.post_title,
        post_table.post_content,
        post_table.file_id,
        post_table.user_id,
        post_table.nickname,
        post_table.created_at,
        post_table.updated_at,
        post_table.deleted_at,
        CASE
            WHEN post_table.\`like\` >= 1000000 THEN CONCAT(ROUND(post_table.\`like\` / 1000000, 1), 'M')
            WHEN post_table.\`like\` >= 1000 THEN CONCAT(ROUND(post_table.\`like\` / 1000, 1), 'K')
            ELSE post_table.\`like\`
        END as \`like\`,
        CASE
            WHEN post_table.comment_count >= 1000000 THEN CONCAT(ROUND(post_table.comment_count / 1000000, 1), 'M')
            WHEN post_table.comment_count >= 1000 THEN CONCAT(ROUND(post_table.comment_count / 1000, 1), 'K')
            ELSE post_table.comment_count
        END as comment_count,
        CASE
            WHEN post_table.hits >= 1000000 THEN CONCAT(ROUND(post_table.hits / 1000000, 1), 'M')
            WHEN post_table.hits >= 1000 THEN CONCAT(ROUND(post_table.hits / 1000, 1), 'K')
            ELSE post_table.hits
        END as hits,
        COALESCE(file_table.file_path, NULL) AS filePath
    FROM post_table
    LEFT JOIN file_table ON post_table.file_id = file_table.file_id
    WHERE post_table.post_id = ? AND post_table.deleted_at IS NULL;
    `;

    const results = await dbConnect.query(sql, [postId]);
    return results;
};

const updatePostHits = async postId => {
    const hitsSql = `
    UPDATE post_table SET hits = hits + 1 WHERE post_id = ? AND deleted_at IS NULL;
    `;

    await dbConnect.query(hitsSql, [postId]);
};

const getUserFileId = async userId => {
    const userSql = `
    SELECT file_id FROM user_table WHERE user_id = ?;
    `;

    const userResults = await dbConnect.query(userSql, [userId]);
    return userResults;
};

const getProfileImagePath = async (fileId, userId) => {
    const profileImageSql = `
    SELECT file_path FROM file_table WHERE file_id = ? AND file_category = 1 AND user_id = ?;
    `;

    const profileImageResults = await dbConnect.query(profileImageSql, [
        fileId,
        userId,
    ]);
    return profileImageResults;
};

export const getPost = async requestData => {
    const { postId } = requestData;

    const results = await getPostDetails(postId);

    if (!results || results.length === 0) return null;

    await updatePostHits(results[0].post_id);

    const userResults = await getUserFileId(results[0].user_id);

    if (!userResults || userResults.length === 0) return results;

    const profileImageResults = await getProfileImagePath(
        userResults[0].file_id,
        results[0].user_id,
    );

    if (!profileImageResults || profileImageResults.length === 0)
        return results;

    results[0].profileImage = profileImageResults[0].file_path;

    return results;
};
/*
legacy code

export const getPost = async requestData => {
    const { postId } = requestData;

    const sql = `
    SELECT 
        post_table.post_id,
        post_table.post_title,
        post_table.post_content,
        post_table.file_id,
        post_table.user_id,
        post_table.nickname,
        post_table.created_at,
        post_table.updated_at,
        post_table.deleted_at,
        CASE
            WHEN post_table.\`like\` >= 1000000 THEN CONCAT(ROUND(post_table.\`like\` / 1000000, 1), 'M')
            WHEN post_table.\`like\` >= 1000 THEN CONCAT(ROUND(post_table.\`like\` / 1000, 1), 'K')
            ELSE post_table.\`like\`
        END as \`like\`,
        CASE
            WHEN post_table.comment_count >= 1000000 THEN CONCAT(ROUND(post_table.comment_count / 1000000, 1), 'M')
            WHEN post_table.comment_count >= 1000 THEN CONCAT(ROUND(post_table.comment_count / 1000, 1), 'K')
            ELSE post_table.comment_count
        END as comment_count,
        CASE
            WHEN post_table.hits >= 1000000 THEN CONCAT(ROUND(post_table.hits / 1000000, 1), 'M')
            WHEN post_table.hits >= 1000 THEN CONCAT(ROUND(post_table.hits / 1000, 1), 'K')
            ELSE post_table.hits
        END as hits,
        COALESCE(file_table.file_path, NULL) AS filePath
    FROM post_table
    LEFT JOIN file_table ON post_table.file_id = file_table.file_id
    WHERE post_table.post_id = ? AND post_table.deleted_at IS NULL;
    `;

    const results = await dbConnect.query(sql, [postId]);

    if (!results || results.length === 0) return null;

    const hitsSql = `
    UPDATE post_table SET hits = hits + 1 WHERE post_id = ? AND deleted_at IS NULL;
    `;

    await dbConnect.query(hitsSql, [results[0].post_id]);

    const userSql = `
    SELECT file_id FROM user_table WHERE user_id = ?;
    `;

    const userResults = await dbConnect.query(userSql, [results[0].user_id]);

    if (!userResults || userResults.length === 0) return results;

    const profileImageSql = `
    SELECT file_path FROM file_table WHERE file_id = ? AND file_category = 1 AND user_id = ?;
    `;

    const profileImageResults = await dbConnect.query(profileImageSql, [
        userResults[0].file_id,
        results[0].user_id,
    ]);

    if (!profileImageResults || profileImageResults.length === 0)
        return results;

    results[0].profileImage = profileImageResults[0].file_path;

    return results;
};
*/

// 게시글 수정
export const updatePost = async requestData => {
    const { postId, userId, postTitle, postContent, attachFilePath } =
        requestData;
    console.log('attachFilePath', attachFilePath);

    const updatePostSql = `
    UPDATE post_table
    SET post_title = ?, post_content = ?
    WHERE post_id = ? AND deleted_at IS NULL;
    `;

    const updatePostResults = await dbConnect.query(updatePostSql, [
        postTitle,
        postContent,
        postId,
    ]);

    if (!updatePostResults) return null;

    if (attachFilePath === null) {
        const sql = `
        UPDATE post_table
        SET file_id = NULL
        WHERE post_id = ?;
        `;
        await dbConnect.query(sql, [postId]);
    } else {
        // 파일 경로 존재 여부 확인
        const checkFilePathSql = `
        SELECT COUNT(*) AS existing
        FROM file_table
        WHERE file_path = ?;
        `;
        const checkResults = await dbConnect.query(checkFilePathSql, [
            attachFilePath,
        ]);
        if (checkResults[0].existing === 0) {
            // 파일 경로가 존재하지 않으면 새로운 파일 정보 삽입
            const postFilePathSql = `
            INSERT INTO file_table
            (user_id, post_id, file_path, file_category)
            VALUES (?, ?, ?, 2);
            `;
            const postFileResults = await dbConnect.query(postFilePathSql, [
                userId,
                postId,
                attachFilePath,
            ]);

            // file_id 업데이트
            const updatePostFileSql = `
            UPDATE post_table
            SET file_id = ?
            WHERE post_id = ?;
            `;
            await dbConnect.query(updatePostFileSql, [
                postFileResults.insertId,
                postId,
            ]);
        }
    }

    return { ...updatePostResults, post_id: postId };
};

export const softDeletePost = async requestData => {
    const { postId } = requestData;

    const sql = `
    UPDATE post_table
    SET deleted_at = NOW()
    WHERE post_id = ? AND deleted_at IS NULL;
    `;
    const results = await dbConnect.query(sql, [postId]);

    if (!results) return null;

    return results;
};

export const checkPostExists = async postId => {
    const sql = `
    SELECT * FROM post_table
    WHERE post_id = ? AND deleted_at IS NULL;
    `;
    const results = await dbConnect.query(sql, [postId]);
    return results.length > 0;
};

export const softDeletePostsByUserId = async userId => {
    const sql = 'UPDATE post_table SET deleted_at = now() WHERE user_id = ?';
    const results = await dbConnect.query(sql, [userId]);
    return results.affectedRows ? results : null;
};
