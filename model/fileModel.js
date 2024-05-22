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
