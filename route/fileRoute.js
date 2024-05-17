import express from 'express';
import * as multerUtil from '../util/multerUtil.js';
import * as fileController from '../controller/fileController.js';

const router = express.Router();

router.post(
    '/upload',
    multerUtil.uploadProfile.single('attachFile'),
    fileController.uploadFile,
);
router.post(
    '/posts/upload',
    multerUtil.uploadPost.single('postFile'),
    fileController.uploadPostFile,
);

export default router;
