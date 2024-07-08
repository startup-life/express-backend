require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const route = require('./route/index.js');
const dbConnect = require('./database/index.js');
const { notFoundHandler, errorHandler } = require('./util/errorHandler.js');

const app = express();
const PORT = process.env.BACKEND_PORT || 3000;

app.use(cors('*'));

app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // https에서만 동작하게 하려면 true로 변경,
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        },
    }),
);

// Routes
app.use('/', route);

// Error Handler
app.use(notFoundHandler);
app.use(errorHandler);

/* 세션 ID 초기화 함수 */
const initSessionId = async () => {
    const sql = 'UPDATE user_table SET session_id = NULL;';
    try {
        await dbConnect.query(sql);
        startServer();
    } catch (error) {
        console.error('Failed to initialize session IDs:', error);
        process.exit(1); // 실패 시 프로세스 종료
    }
};

// 서버 시작 함수
const startServer = () => {
    app.listen(PORT, () => {
        console.log(`edu-community app listening on port ${PORT}`);
    });
};

// 초기화 후 서버 시작
initSessionId();
