require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const route = require('./route/index.js');
const dbConnect = require('./database/index.js');
const { notFoundHandler, errorHandler } = require('./util/errorHandler.js');
const timeout = require('connect-timeout');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { STATUS_MESSAGE } = require('./util/constant/httpStatusCode');

const app = express();
const PORT = process.env.BACKEND_PORT || 3000;

// const corsOptions = {
//     origin: [
//         'https://node-community.startupcode.kr',
//         'https://node-community-api.startupcode.kr',
//     ],
// };

// CORS 설정
app.use(cors('*'));

// 세션 초기화 함수
const initSessionId = async () => {
    const sql = 'UPDATE user_table SET session_id = NULL;';
    try {
        await dbConnect.query(sql);
        startHttpServer();
    } catch (error) {
        console.error('Failed to initialize session IDs:', error);
        process.exit(1); // 실패 시 프로세스 종료
    }
};

const startHttpServer = () => {
    return app.listen(PORT, () => {
        console.log(`edu-community app listening on port ${PORT}`);
    });
};

// 요청 속도 제한 설정
const limiter = rateLimit({
    // 10초동안
    windowMs: 10 * 1000,
    // 최대 100번의 요청을 허용
    max: 100,
    // 제한 초과 시 전송할 메시지
    message: STATUS_MESSAGE.TOO_MANY_REQUESTS,
    // RateLimit 헤더 정보를 표준으로 사용할 지 여부
    standardHeaders: true,
    // 레거시 X-RateLimit 헤더를 제거할 지 여부
    legacyHeaders: false
});

// 정적 파일 경로 설정
app.use('/public', express.static('public'));

// JSON 및 URL-encoded 요청 파싱
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 세션 설정
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // https에서만 동작하게 하려면 true로 변경,
            maxAge: 1000 * 60 * 60 * 24 // 1 day
        }
    })
);

// 요청 속도 제한 미들웨어
app.use(limiter);

// helmet 설정
app.use(helmet());

// Routes
app.use('/', route);

// Error Handler
// app.use(notFoundHandler);
app.use(errorHandler);

// health check
app.get('/health/check', (req, res) => {
    res.status(200).send('ok');
});

// Timeout 설정
app.use(timeout('5s'));

// 초기화 후 서버 시작
initSessionId();

module.exports = { app, startHttpServer };
