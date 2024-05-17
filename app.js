import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { createServer } from 'https';
import { readFileSync } from 'fs';
import timeout from 'connect-timeout';
import rateLimit from 'express-rate-limit';

import * as dbConnect from './database/index.js';
import routes from './route/index.js';

const app = express();
const port = 80;

app.use(cors('*'));

app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
    session({
        secret: 'startupcode!adapterz@', // secret key
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false, // https에서만 동작하게 하려면 true로 변경,
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        },
    }),
);

// 요청 속도 제한 설정
const limiter = rateLimit({
    // 1분 동안
    windowMs: 60 * 1000,
    // 최대 100개의 요청을 허용
    max: 100,
    // 제한 초과 시 전송할 메시지
    message: 'too_many_requests',
    // RateLimit 헤더 정보를 표준으로 사용할지 여부
    standardHeaders: true,
    // 레거시 X-RateLimit 헤더를 제거할지 여부
    legacyHeaders: false,
});

// 모든 요청에 대해 요청 속도 제한 적용
app.use(limiter);

// Routes
app.use('/', routes);

// // 서버 에러 500 응답
// app.use((error, request, response) => {
//     response.status(error.status || 500);
//     response.send({
//         error: {
//             message: error.message,
//         },
//     });
// });

// 요청 타임아웃 설정 (예: 5초)
app.use(timeout('5s'));

// 타임아웃 발생 시 처리 핸들러
app.use((request, response, next) => {
    if (!request.timedout) next();
    else
        response.status(503).send({
            status: 503,
            message: 'Request_timeout',
            data: null,
        });
});

// 서버 시작하면 전체 유저 데이터 session_id NULL로 초기화
const initSessionId = async (response, request) => {
    const sql = 'UPDATE user_table SET session_id = NULL;';
    await dbConnect.query(sql, response, request);
};

initSessionId();

if (process.env.NODE_ENV === 'production') {
    const option = {
        key: readFileSync('/home/ubuntu/cert/privkey.pem'),
        cert: readFileSync('/home/ubuntu/cert/fullchain.pem'),
    };

    createServer(option, app).listen(443, () => {
        console.log('[HTTPS] edu-web-backend app listening on port 443');
    });

    app.listen(port, () => {
        console.log(`[HTTP] edu-web-backend app listening on port ${port}`);
    });
} else {
    app.listen(port, () => {
        console.log(`[HTTP] edu-web-backend app listening on port ${port}`);
    });
}
