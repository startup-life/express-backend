const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');

// AWS S3 설정 (직접 자격 증명 포함 - 실제 배포 시에는 사용하지 말 것)
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// 프로필 이미지를 위한 multer-s3 storage 설정
const profileStorage = multerS3({
    s3: s3Client,
    bucket: process.env.S3_BUCKET_NAME, // S3 버킷의 이름
    metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(
            null,
            `image/profile/${file.fieldname}-${uniqueSuffix}.${file.originalname.split('.').pop()}`,
        );
    },
});

// 게시물 이미지를 위한 multer-s3 storage 설정
const postStorage = multerS3({
    s3: s3Client,
    bucket: process.env.S3_BUCKET_NAME, // S3 버킷의 이름
    metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(
            null,
            `image/post/${file.fieldname}-${uniqueSuffix}.${file.originalname.split('.').pop()}`,
        );
    },
});

// 각각의 storage 설정을 사용하여 두 개의 multer 인스턴스 생성
const uploadProfile = multer({ storage: profileStorage });
const uploadPost = multer({ storage: postStorage });

module.exports = { uploadProfile, uploadPost };

/*
const multer = require('multer');

// 프로필 이미지를 위한 multer storage 설정
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/image/profile');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(
            null,
            `${file.fieldname}-${uniqueSuffix}.${file.originalname.split('.').pop()}`,
        );
    },
});

// 게시물 이미지를 위한 multer storage 설정
const postStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/image/post');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(
            null,
            `${file.fieldname}-${uniqueSuffix}.${file.originalname.split('.').pop()}`,
        );
    },
});

// 각각의 storage 설정을 사용하여 두 개의 multer 인스턴스 생성
const uploadProfile = multer({ storage: profileStorage });
const uploadPost = multer({ storage: postStorage });

module.exports = { uploadProfile, uploadPost };
*/
