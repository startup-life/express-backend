const redis = require('redis');

// 로컬 환경
const redisClient = redis.createClient({ legacyMode: true }); // legacy 모드 반드시 설정

// 클라우드 환경
/*
const redisClient = redis.createClient({
    url: 'redis://<username>:<password>@<host>:<port>', // 클라우드 Redis URL
    legacyMode: true, // 콜백 기반 모드를 위한 설정
});
*/

redisClient.on('connect', () => {
    console.info('Redis connected!');
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});

redisClient.connect().then(); // redis v4 연결 (비동기)

module.exports = redisClient;
