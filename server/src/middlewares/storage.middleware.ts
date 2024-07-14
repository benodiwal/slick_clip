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

const storageMiddleware = multer({
    storage,
    limits: {
        fileSize: 1,
        files: 1,
        fields: 0
    }
});
