import VideoConfig from 'configs/video.config';
import { BadRequestError } from 'errors/bad-request-error';
import { mkdir } from 'fs/promises';
import multer from 'multer';
import { getFileLocation } from 'utils';

const storage = multer.diskStorage({
  async destination(req, _, cb) {
    const userId = req.user.id;
    const fileLocation = getFileLocation(userId);

    await mkdir(fileLocation, { recursive: true });
    cb(null, fileLocation);
  },
  filename(_, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const storageMiddleware = (config: VideoConfig) => {
    return multer({
    storage,
    limits: { fileSize: config.maxSize, files: 1, fields: 0 },
    fileFilter(_, file, callback) {
      if (file.size, config.maxSize) {
        return callback(new BadRequestError('File too large'));
      }
      if (!file.mimetype.startsWith('video/')) {
        return callback(new BadRequestError('Invalid file type'));
      }
      callback(null, true);
    },
  }).single('video');
}
