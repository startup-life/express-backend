const express = require('express');
const router = express.Router();
const fs = require('fs');

// route 폴더에 있는 파일의 이름을 조회해서 라우팅
fs.readdirSync(__dirname)
    .filter(file => {
        return (
            file.indexOf('.') !== 0 &&
            file !== 'index.js' &&
            file.slice(-3) === '.js'
        );
    })
    .forEach(file => {
        const route = require(`./${file}`);
        router.use(route);
    });

module.exports = router;
