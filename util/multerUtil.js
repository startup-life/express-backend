import multer from 'multer';

const PROFILE_PATH = './public/image/profile';
const POST_PATH = './public/image/post';

// 프로필 이미지를 위한 multer storage 설정
const profileStorage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, PROFILE_PATH);
    },
    filename: (request, file, callback) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        callback(
            null,
            `${file.fieldname}-${uniqueSuffix}.${file.originalname.split('.').pop()}`,
        );
    },
});

// 게시물 이미지를 위한 multer storage 설정
const postStorage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, POST_PATH);
    },
    filename: (request, file, callback) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        callback(
            null,
            `${file.fieldname}-${uniqueSuffix}.${file.originalname.split('.').pop()}`,
        );
    },
});

// 각각의 storage 설정을 사용하여 두 개의 multer 인스턴스 생성
const uploadProfile = multer({ storage: profileStorage });
const uploadPost = multer({ storage: postStorage });

export { uploadProfile, uploadPost };
