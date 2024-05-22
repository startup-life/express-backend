import * as dbConnect from '../database/index.js';

export const writeComment = async requestData => {
    const { postId, userId, commentContent } = requestData;

    const nicknameSql = `
    SELECT nickname FROM user_table
    WHERE user_id = ? AND deleted_at IS NULL;
    `;
    const nicknameResults = await dbConnect.query(nicknameSql, [userId]);
    if (!nicknameResults || nicknameResults.length === 0) return null;
    const { nickname } = nicknameResults[0];

    const checkPostSql = `
    SELECT * FROM post_table
    WHERE post_id = ? AND deleted_at IS NULL;
    `;
    const checkPostResults = await dbConnect.query(checkPostSql, [postId]);

    if (!checkPostResults || checkPostResults.length === 0) return null;

    const sql = `
    INSERT INTO comment_table
    (post_id, user_id, nickname, comment_content)
    VALUES (?, ?, ?, ?);
    `;
    const results = await dbConnect.query(sql, [
        postId,
        userId,
        nickname,
        commentContent,
    ]);

    if (!results) return 'insert_error';

    const commentsCountSql = `
    UPDATE post_table
    SET comment_count = comment_count + 1
    WHERE post_id = ?;
    `;
    await dbConnect.query(commentsCountSql, [postId]);

    return results;
};

export const getComments = async requestData => {
    const { postId } = requestData;

    const sql = `
    SELECT ct.*, ut.file_id, COALESCE(ft.file_path, '/public/image/profile/default.jpg') AS profileImage
    FROM comment_table AS ct
    LEFT JOIN user_table AS ut ON ct.user_id = ut.user_id
    LEFT JOIN file_table AS ft ON ut.file_id = ft.file_id
    WHERE ct.post_id = ? AND ct.deleted_at IS NULL;
    `;
    const results = await dbConnect.query(sql, [postId]);

    if (!results || results.length === 0) return null;
    return results;
};

export const updateComment = async requestData => {
    const { postId, commentId, userId, commentContent } = requestData;

    const checkPostSql = `
    SELECT * FROM post_table
    WHERE post_id = ? AND deleted_at IS NULL;
    `;
    const checkPostResults = await dbConnect.query(checkPostSql, [postId]);

    if (!checkPostResults || checkPostResults.length === 0) return null;

    const sql = `
    UPDATE comment_table
    SET comment_content = ?
    WHERE post_id = ? 
    AND comment_id = ? 
    AND user_id = ?
    AND deleted_at IS NULL;
    `;
    const results = await dbConnect.query(sql, [
        commentContent,
        postId,
        commentId,
        userId,
    ]);

    if (!results || results.affectedRows === 0) return 'update_error';

    return results;
};

export const softDeleteComment = async requestData => {
    const { postId, commentId, userId } = requestData;

    const checkPostSql = `
    SELECT * FROM post_table
    WHERE post_id = ? AND deleted_at IS NULL;
    `;
    const checkPostResults = await dbConnect.query(checkPostSql, [postId]);
    if (!checkPostResults || checkPostResults.length === 0) {
        return null;
    }

    const sql = `
    UPDATE comment_table
    SET deleted_at = now()
    WHERE post_id = ?
    AND comment_id = ?
    AND user_id = ?
    AND deleted_at IS NULL;
    `;
    const results = await dbConnect.query(sql, [postId, commentId, userId]);

    if (!results || results.affectedRows === 0) return 'delete_error';

    const commentsCountSql = `
    UPDATE post_table
    SET comment_count = comment_count - 1
    WHERE post_id = ?;
    `;
    await dbConnect.query(commentsCountSql, [postId]);

    return results;
};
