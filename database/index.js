const mysql = require('mysql2/promise');
const colors = require('colors');

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    connectionLimit: 10,
    waitForConnections: true,
};

/* DB Pool 생성 */
const pool = mysql.createPool(config);

/* 쿼리 함수 */
/*const query = async (queryString, response) => {
    console.log(colors.yellow(queryString));

    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            // 트랜잭션 시작
            // await connection.beginTransaction(); // 트랜잭션 사용 시

            const [rows] = await connection.query(queryString);

            // 트랜잭션 커밋
            // await connection.commit(); // 트랜잭션 사용 시

            // 사용 완료된 커넥션 반환
            connection.release();

            return rows;
        } catch (error) {
            // 트랜잭션 롤백
            // 트랜잭션 사용 시
            // await connection.rollback();

            console.error('Query Error');
            console.error(error);

            // 에러 발생 시 커넥션 반환
            connection.release();

            return response.status(500).json({ code: 'Query Error' });
        }
    } catch (error) {
        console.error('DB Error');
        console.error(error);

        return response.status(500).json({ code: 'DB Error' });
    }
};*/
const query = async (queryString, params, response) => {
    console.log(colors.yellow(queryString));

    let connection;
    try {
        connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute(queryString, params);
            connection.release();
            return rows;
        } catch (error) {
            console.error('Query Error');
            console.error(error);
            if (connection) connection.release();
            if (response) {
                return response.status(500).json({ code: 'Query Error' });
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('DB Error');
        console.error(error);
        if (connection) connection.release();
        if (response) {
            return response.status(500).json({ code: 'DB Error' });
        } else {
            throw error;
        }
    }
};

module.exports = { config, pool, query };
