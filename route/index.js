import express from 'express';
/* !! 정적 라우팅 !! */
import userRoute from './userRoute.js'; // 사용자 라우트
import postRoute from './postRoute.js'; // 게시물 라우트
import fileRoute from './fileRoute.js'; // 파일 라우트
import commentRoute from './commentRoute.js'; // 댓글 라우트

const router = express.Router();

// 각 라우트를 수동으로 설정
router.use(userRoute);
router.use(postRoute);
router.use(fileRoute);
router.use(commentRoute);

/* !! 동적 라우팅 !! */
/*
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// route 폴더에 있는 파일의 이름을 조회해서 라우팅
fs.readdirSync(__dirname)
    .filter(file => {
        return (
            file.indexOf('.') !== 0 &&
            file !== 'index.js' &&
            file.slice(-3) === '.js'
        );
    })
    .forEach(async file => {
        const filePath = join(__dirname, file);
        const route = await import(filePath);
        router.use(route.default);
    });
*/

export default router;
