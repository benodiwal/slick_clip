import VideoConfig from 'configs/video.config';
import { BadRequestError } from 'errors/bad-request-error';
import { mkdir } from 'fs/promises';
import multer from 'multer';
import { getFileLocation } from 'utils';

const storage = multer.diskStorage({
  destination: async (req, _, cb) => {
    try {
      const userId = req.user.id;
      const fileLocation = getFileLocation(userId);

      await mkdir(fileLocation, { recursive: true });
      cb(null, fileLocation);
    } catch (error) {
      cb(new BadRequestError('Smth Happen'), '');
    }
  },
  filename: (_, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const storageMiddleware = (config: VideoConfig) => {
  return multer({
    storage,
    limits: { fileSize: config.maxSize, files: 1 },
    fileFilter: (_, file, cb) => {
      if (file.size > config.maxSize) {
        return cb(new BadRequestError('Invalid file size'));
      }
      if (!file.mimetype.startsWith('video/')) {
        return cb(new BadRequestError('Invalid file type'));
      }
      cb(null, true);
    },
  }).single('video');
};
