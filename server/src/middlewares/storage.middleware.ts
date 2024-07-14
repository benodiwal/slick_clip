import multer from 'multer';

const storage = multer.diskStorage({
    async destination(req, _, cb) {
        console.log(req);
        cb(null, '/uploads');
    },
    filename(_, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
