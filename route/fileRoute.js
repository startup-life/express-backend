import express from 'express';
import * as multerUtil from '../util/multerUtil.js';
import * as fileController from '../controller/fileController.js';

const router = express.Router();

router.post(
    '/users/upload/profile-image',
    multerUtil.uploadProfile.single('profileImage'),
    fileController.uploadFile,
);
router.post(
    '/posts/upload/attach-file',
    multerUtil.uploadPost.single('postFile'),
    fileController.uploadPostFile,
);

export default router;
