import * as dbConnect from '../database/index.js';

export const uploadProfileImage = async requestData => {
    try {
        const { userId, profileImagePath } = requestData;

        const profileImagePathSql = `
        INSERT INTO file_table (user_id, file_path, file_category)
        VALUES (?, ?, 1);
        `;
        const [profileResults] = await dbConnect.query(profileImagePathSql, [
            userId,
            profileImagePath,
        ]);

        const userProfileSql = `
        UPDATE user_table
        SET file_id = ?
        WHERE user_id = ?;
        `;
        await dbConnect.query(userProfileSql, [
            profileResults.insertId,
            userId,
        ]);

        return profileResults.insertId;
    } catch (error) {
        console.log('Error: [M]uploadProfileImage: ', error);
        throw new Error('Database error');
    }
};

export const uploadPostFile = async requestData => {
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

    if (!postFileResults.insertId) {
        throw new Error('FILE_UPLOAD_FAILED');
    }

    const updatePostSql = `
    UPDATE post_table
    SET file_id = ?
    WHERE post_id = ?;
    `;

    await dbConnect.query(updatePostSql, [postFileResults.insertId, postId]);

    return postFileResults.insertId;
};

export const getFileIdByPath = async filePath => {
    const sql = `
        SELECT file_id
        FROM file_table
        WHERE file_path = ?;
    `;
    const results = await dbConnect.query(sql, [filePath]);
    console.log('dd', results);
    return results.length > 0 ? results[0].file_id : null;
};

export const getFileIdByPostId = async postId => {
    const sql = `
    SELECT file_id FROM post_table WHERE post_id = ?;
    `;
    const results = await dbConnect.query(sql, [postId]);
    return results.length > 0 ? results[0].file_id : null;
};

export const updatePostFileId = async (postId, fileId) => {
    const sql = `
        UPDATE post_table
        SET file_id = ?
        WHERE post_id = ?;
    `;
    const results = await dbConnect.query(sql, [fileId, postId]);
    return results.affectedRows > 0;
};
