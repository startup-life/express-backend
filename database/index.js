import path from 'path';
import { fileURLToPath } from 'url'; // 추가
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import colors from 'colors';
import moment from 'moment';
import { STATUS_CODES, MESSAGES } from '../util/responseConstants.js';

// 현재 파일의 경로를 정확히 얻기 위해 fileURLToPath 사용
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // 현재 디렉터리 경로

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    port: process.env.DB_PORT,
    connectionLimit: 10, // 기본값은 10
};

/* DB Pool 생성 */
const pool = mysql.createPool(config);

/* 쿼리 함수 */
const query = async (queryString, response, request) => {
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    // 색상 선택: yellow, cyan, white, magenta, green, red, grey, blue, rainbow
    console.log(`${now} - ${colors.yellow(queryString)}`);
    // console.log(colors.yellow(queryString));
    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            // 트랜잭션 시작
            // await connection.beginTransaction(); // 트랜잭션 사용 시

            const [rows] = await connection.query(queryString);

            // 트랜잭션 커밋
            // await connection.commit(); // 트랜잭션 사용 시

            connection.release(); // 사용 완료된 커넥션 반환

            return rows;
        } catch (error) {
            // 트랜잭션 롤백
            // await connection.rollback(); // 트랜잭션 사용 시

            console.error('Query Error');
            console.error(error);

            connection.release(); // 에러 발생 시 커넥션 반환

            return response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                status: STATUS_CODES.INTERNAL_SERVER_ERROR,
                message: MESSAGES.QUERY_ERROR,
                data: null,
            });
        }
    } catch (error) {
        console.error('DB Error');
        console.error(error);

        return response.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
            message: MESSAGES.DB_ERROR,
            data: null,
        });
    }
};

export { config, pool, query };
