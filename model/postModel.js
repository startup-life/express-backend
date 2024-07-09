const dbConnect = require('../database/index.js');
const { STATUS_MESSAGE } = require('../util/constant/httpStatusCode');

// 게시글 작성 (일반 게시글)
// 게시글 작성 (일반 게시글)
exports.writePost = async requestData => {
    const { userId, postTitle, postContent, attachFilePath } = requestData;

    const nicknameSql = `
    SELECT nickname FROM user_table
    WHERE user_id = ? AND deleted_at IS NULL;
    `;
    const nicknameResults = await dbConnect.query(nicknameSql, [userId]);

    if (!nicknameResults[0]) {
        return STATUS_MESSAGE.NOT_FOUND_USER;
    }

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
    if (!writePostResults) {
        return null;
    }

    if (attachFilePath) {
        const postFilePathSql = `
        INSERT INTO file_table
        (user_id, post_id, file_path, file_category)
        VALUES (?, ?, ?, 2);
        `;
        const postFileResults = await dbConnect.query(postFilePathSql, [
            userId,
            writePostResults.insertId,
            attachFilePath,
        ]);

        const updatePostSql = `
        UPDATE post_table
        SET file_id = ?
        WHERE post_id = ?;
        `;
        await dbConnect.query(updatePostSql, [
            postFileResults.insertId,
            writePostResults.insertId,
        ]);

        writePostResults.filePath = attachFilePath;
    }

    return writePostResults;
};
/*exports.writePlainPost = async (requestData, response) => {
    const { userId, postTitle, postContent } = requestData;

    const nicknameSql = `
    SELECT nickname FROM user_table
    WHERE user_id = ${userId} AND deleted_at IS NULL;
    `;
    const nicknameResults = await dbConnect.query(nicknameSql, response);
    console.log(nicknameResults);

    const writePostSql = `
    INSERT INTO post_table
    (user_id, nickname, post_title, post_content)
    VALUES (${userId}, '${nicknameResults[0].nickname}', ${postTitle}, ${postContent});
    `;

    const writePostResults = await dbConnect.query(writePostSql, response);
    return writePostResults;
};

// 파일 업로드
exports.uploadFile = async (requestData, response) => {
    const { userId, postId, filePath } = requestData;

    const postFilePathSql = `
    INSERT INTO file_table
    (user_id, post_id, file_path, file_category)
    VALUES (${userId}, ${postId}, ${filePath}, 2);
    `;

    const postFileResults = await dbConnect.query(postFilePathSql, response);

    const updatePostSql = `
    UPDATE post_table
    SET file_id = ${postFileResults.insertId}
    WHERE post_id = ${postId};
    `;

    const updatePostResults = await dbConnect.query(updatePostSql, response);
    return updatePostResults.insertId;
};*/

// 게시글 목록 조회
exports.getPosts = async (requestData, response) => {
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
    LIMIT ${limit} OFFSET ${offset};
    `;
    const results = await dbConnect.query(sql, response);

    if (!results) return null;
    return results;
};

// 게시글 상세 조회
/*    const sql = `
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
WHERE post_table.post_id = ${postId} AND post_table.deleted_at IS NULL;
`;
const results = await dbConnect.query(sql, response);

if (!results || results.length === 0) return null;

// 조회수 증가
const hitsSql = `
UPDATE post_table SET hits = hits + 1 WHERE post_id = ${results[0].post_id} AND deleted_at IS NULL;
`;
await dbConnect.query(hitsSql, response);

const userSql = `
SELECT file_id FROM user_table WHERE user_id = ${results[0].user_id};
`;
const userResults = await dbConnect.query(userSql, response);

if (!userResults || userResults.length === 0) return results;

// 프로필 이미지 가져오기
const profileImageSql = `
SELECT file_path FROM file_table WHERE file_id = ${userResults[0].file_id} AND file_category = 1 AND user_id = ${results[0].user_id};
`;

const profileImageResults = await dbConnect.query(
    profileImageSql,
    response,
);

if (!profileImageResults || profileImageResults.length === 0)
    return results;

results[0].profileImage = profileImageResults[0].file_path;

return results;*/
exports.getPost = async (requestData, response) => {
    const { postId } = requestData;

    // 게시글 정보 가져오기
    const postSql = `
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
            ELSE CAST(post_table.\`like\` AS CHAR)
        END as \`like\`,
        CASE
            WHEN post_table.comment_count >= 1000000 THEN CONCAT(ROUND(post_table.comment_count / 1000000, 1), 'M')
            WHEN post_table.comment_count >= 1000 THEN CONCAT(ROUND(post_table.comment_count / 1000, 1), 'K')
            ELSE CAST(post_table.comment_count AS CHAR)
        END as comment_count,
        CASE
            WHEN post_table.hits >= 1000000 THEN CONCAT(ROUND(post_table.hits / 1000000, 1), 'M')
            WHEN post_table.hits >= 1000 THEN CONCAT(ROUND(post_table.hits / 1000, 1), 'K')
            ELSE CAST(post_table.hits AS CHAR)
        END as hits,
        COALESCE(file_table.file_path, NULL) AS filePath
    FROM post_table
    LEFT JOIN file_table ON post_table.file_id = file_table.file_id
    WHERE post_table.post_id = ? AND post_table.deleted_at IS NULL;
    `;
    const results = await dbConnect.query(postSql, [postId], response);

    if (!results || results.length === 0) return null;

    const postResult = results[0];

    // 조회수 증가
    const hitsSql = `
        UPDATE post_table SET hits = hits + 1 WHERE post_id = ? AND deleted_at IS NULL;
        `;
    await dbConnect.query(hitsSql, [postId], response);

    // 유저 프로필 이미지 file id 가져오기
    const userSql = `
        SELECT file_id FROM user_table WHERE user_id = ?;
        `;
    const userResults = await dbConnect.query(
        userSql,
        [postResult.user_id],
        response,
    );

    // 유저 프로필 이미지 가져오기
    if (userResults && userResults.length > 0) {
        const profileImageSql = `
            SELECT file_path FROM file_table WHERE file_id = ? AND file_category = 1 AND user_id = ?;
            `;
        const profileImageResults = await dbConnect.query(
            profileImageSql,
            [userResults[0].file_id, postResult.user_id],
            response,
        );

        if (profileImageResults && profileImageResults.length > 0) {
            postResult.profileImage = profileImageResults[0].file_path;
        }
    }
    return postResult;
};

// 게시글 수정
exports.updatePost = async requestData => {
    const { postId, userId, postTitle, postContent, attachFilePath } =
        requestData;

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
/*exports.updatePost = async (requestData, response) => {
    const { postId, userId, postTitle, postContent, attachFilePath } =
        requestData;
    console.log('attachFilePath', attachFilePath);
    const updatePostSql = `
    UPDATE post_table
    SET post_title = ${postTitle}, post_content = ${postContent}
    WHERE post_id = ${postId} AND deleted_at IS NULL;
    `;

    const updatePostResults = await dbConnect.query(updatePostSql, response);

    if (!updatePostResults) return null;

    if (attachFilePath === null) {
        const sql = `
        UPDATE post_table
        SET file_id = NULL
        WHERE post_id = ${postId};
        `;
        await dbConnect.query(sql, response);
    } else {
        // 파일 경로 존재 여부 확인
        const checkFilePathSql = `
        SELECT COUNT(*) AS existing
        FROM file_table
        WHERE file_path = ${attachFilePath};
        `;
        const checkResults = await dbConnect.query(checkFilePathSql, response);
        if (checkResults[0].existing === 0) {
            // 파일 경로가 존재하지 않으면 새로운 파일 정보 삽입
            const postFilePathSql = `
            INSERT INTO file_table
            (user_id, post_id, file_path, file_category)
            VALUES (${userId}, ${postId}, ${attachFilePath}, 2);
            `;
            const postFileResults = await dbConnect.query(
                postFilePathSql,
                response,
            );

            // file_id 업데이트
            const updatePostFileSql = `
            UPDATE post_table
            SET file_id = ${postFileResults.insertId}
            WHERE post_id = ${postId};
            `;
            await dbConnect.query(updatePostFileSql, response);
        }
    }

    return { ...updatePostResults, post_id: postId };
};*/

exports.softDeletePost = async requestData => {
    const { postId } = requestData;

    const sql = `
    UPDATE post_table
    SET deleted_at = NOW()
    WHERE post_id = ? AND deleted_at IS NULL;
    `;
    const results = await dbConnect.query(sql, [postId]);

    if (!results || results.affectedRows === 0) return null;

    return results;
};
/*exports.softDeletePost = async (requestData, response) => {
    const { postId } = requestData;

    const sql = `
    UPDATE post_table
    SET deleted_at = NOW()
    WHERE post_id = ${postId} AND deleted_at IS NULL;
    `;
    const results = await dbConnect.query(sql, response);

    if (!results) return null;

    return results;
};*/
