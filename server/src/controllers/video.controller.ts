import { InternalServerError } from 'errors/internal-server-error';
import { Request, Response, NextFunction } from 'express';
import AbstractController from './index.controller';
import z from 'zod';
import { storageMiddleware } from 'middlewares/storage.middleware';
import { validateRequestBody, validateRequestParams } from 'validators/validateRequest';
import { BadRequestError } from 'errors/bad-request-error';
import { NotFoundError } from 'errors/not-found-error';
import getEnvVar from 'env/index';
import { generateUniqueUrl, getFileLocation } from 'utils/index';
import Clipper from 'libs/clipper.lib';
import { stat } from 'fs/promises';
import { Video } from '@prisma/client';

class VideoController extends AbstractController {
  get() {
    return [
      async (_: Request, res: Response, next: NextFunction) => {
        try {
          const videos = await this.ctx.db.client.video.findMany({});
          res.status(201).json({ data: videos });
        } catch (e: unknown) {
          console.error(e);
          next(new InternalServerError());
        }
      },
    ];
  }

  getVideoById() {
    const paramsSchema = z.object({ id: z.string() });
    type IParams = z.infer<typeof paramsSchema>;
    return [
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const { id } = req.params as unknown as IParams;
          const video = await this.ctx.db.client.video.findUnique({
            where: {
              id,
            },
          });

          if (!video) {
            return res.status(404).json({ msg: 'Video not found' });
          }

          if (video.userId != req.user.id) {
            return res.status(403).json({ msg: 'Access Forbidden' });
          }

          res.status(201).json({ data: video });
        } catch (e) {
          console.error(e);
          next(new InternalServerError());
        }
      },
    ];
  }

  upload() {
    return [
      storageMiddleware(this.config),
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const file = req.file;

          if (!file) {
            return next(new BadRequestError('File not found'));
          }

          const duration = await Clipper.validate(file.path);

          const video = await this.ctx.db.client.video.create({
            data: {
              userId: req.user.id,
              title: file.filename,
              size: file.size,
              duration,
              filePath: `${req.user.id}/${file.filename}`,
            },
          });

          res.status(201).json(video);
        } catch (e: unknown) {
          console.log(e);
          console.error(e);
          next(new InternalServerError());
        }
      },
    ];
  }

  trim() {
    const paramsSchema = z.object({ id: z.string() });
    type IParams = z.infer<typeof paramsSchema>;

    const payloadSchema = z.object({
      start: z.optional(z.number()),
      end: z.optional(z.number()),
    });
    type IPayload = z.infer<typeof payloadSchema>;

    return [
      validateRequestParams(paramsSchema),
      validateRequestBody(payloadSchema),
      async (req: Request<unknown, undefined, IPayload>, res: Response, next: NextFunction) => {
        try {
          const { start, end } = req.body;
          const { id } = req.params as unknown as IParams;

          if (!start && !end) {
            return next(new BadRequestError('one of start or end is required'));
          }

          const video = await this.ctx.db.client.video.findUnique({
            where: {
              id,
            },
          });

          if (!video) {
            return next(new NotFoundError());
          }

          if (video.userId != req.user.id) {
            return res.status(403).json({ msg: 'Access Forbidden' });
          }

          let startTrim = 0;
          let endTrim = video.duration;
          if (start) {
            if (start < 0) {
              return next(new BadRequestError('Start must not be negative'));
            }
            startTrim = start;
          }

          if (end) {
            if (end >= video.duration) {
              return next(new BadRequestError('End must be less than video duration'));
            }
            endTrim = end;
          }

          if (start && end && start >= end) {
            return next(new BadRequestError('Start must be less than end'));
          }

          if (endTrim - startTrim < this.config.minDuration) {
            return next(new BadRequestError('Trimmed should duration is shorter than the min duration'));
          }

          const inputPath = `${getEnvVar('STORAGE_PATH')}/${video.filePath}`;
          const newVideoName = `${Date.now()}-${video.title}`;
          const outputPath = getFileLocation(req.user.id) + '/' + newVideoName;
          await Clipper.trim({ inputPath, outputPath, start: startTrim, end: endTrim });
          const newVideoStats = await stat(outputPath);
          const newVideoSize = newVideoStats.size;

          const newVideo = await this.ctx.db.client.video.create({
            data: {
              duration: endTrim - startTrim,
              title: newVideoName,
              size: newVideoSize,
              filePath: `/${req.user.id}/${newVideoName}`,
              userId: req.user.id,
            },
          });

          res.status(200).json(newVideo);
        } catch (e) {
          console.error(e);
          next(new InternalServerError());
        }
      },
    ];
  }

  merge() {
    const payloadSchema = z.object({ videoIds: z.array(z.string()) });
    type IPayload = z.infer<typeof payloadSchema>;

    return [
      validateRequestBody(payloadSchema),
      async (req: Request<unknown, unknown, IPayload>, res: Response, next: NextFunction) => {
        try {
          const { videoIds } = req.body;

          const videosSet = new Set(videoIds);

          if (videosSet.size !== videoIds.length) {
            return next(new BadRequestError('Duplicate videoIds'));
          }

          const videos: Video[] = [];
          let totalDutation = 0;

          for (const videoId of videoIds) {
            const video = await this.ctx.db.client.video.findUnique({
              where: {
                id: videoId,
              },
            });
            if (!video) {
              return next(new BadRequestError(`Invalid VideoId: ${videoId}`));
            }
            if (video.userId !== req.user.id) {
              return res.status(403).json({ msg: 'Access Forbidden' });
            }
            totalDutation += video.duration;
            videos.push(video);
          }

          if (totalDutation > this.config.maxDuration) {
            return next(new BadRequestError('Total Duration too long'));
          }

          const videoFilePaths: string[] = [];
          videos.forEach((video) => {
            const videoFilePath = `${getEnvVar('STORAGE_PATH')}/${video.filePath}`;
            videoFilePaths.push(videoFilePath);
          });

          const mergedVideoFileName = `${Date.now()}-merged.mp4`;
          const mergedVideoLocation = getFileLocation(req.user.id) + '/' + mergedVideoFileName;
          await Clipper.merge({ inputPaths: videoFilePaths, outputPath: mergedVideoLocation });

          const mergredVideoStats = await stat(mergedVideoLocation);
          const mergedVideoSize = mergredVideoStats.size;

          const mergedVideo = await this.ctx.db.client.video.create({
            data: {
              duration: totalDutation,
              title: mergedVideoFileName,
              userId: req.user.id,
              filePath: `${req.user.id}/${mergedVideoFileName}`,
              size: mergedVideoSize,
            },
          });

          res.status(201).json(mergedVideo);
        } catch (e) {
          console.error(e);
          next(new InternalServerError());
        }
      },
    ];
  }

  delete() {
    const paramsSchema = z.object({ id: z.string() });
    type IParams = z.infer<typeof paramsSchema>;
    return [
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const { id } = req.params as unknown as IParams;
          const video = await this.ctx.db.client.video.findUnique({
            where: {
              id,
            },
          });

          if (!video) {
            return res.status(404).json({ msg: 'Video not found' });
          }

          if (video.userId != req.user.id) {
            return res.status(403).json({ msg: 'Access Forbidden' });
          }

          await this.ctx.db.client.video.delete({
            where: {
              id,
            },
          });

          res.sendStatus(204);
        } catch (e) {
          console.error(e);
          next(new InternalServerError());
        }
      },
    ];
  }

  createLink() {
    const paramsSchema = z.object({ id: z.string() });
    type IParams = z.infer<typeof paramsSchema>;

    const payloadSchema = z.object({ expiresIn: z.number() });
    type IPayload = z.infer<typeof payloadSchema>;

    return [
      validateRequestParams(paramsSchema),
      validateRequestBody(payloadSchema),
      async (req: Request<unknown, unknown, IPayload>, res: Response, next: NextFunction) => {
        try {
          const { id } = req.params as unknown as IParams;
          const { expiresIn } = req.body;

          const video = await this.ctx.db.client.video.findFirst({
            where: {
              id,
              userId: req.user.id,
            },
          });

          if (!video) {
            return res.status(404).json({ error: 'Video not found or access denied' });
          }

          const url = generateUniqueUrl();
          const expiresAt = new Date(Date.now() + expiresIn * 1000);

          const sharedLink = await this.ctx.db.client.shareLink.create({
            data: {
              url,
              expiresAt,
              videoId: video.id,
            },
          });

          res.status(201).json({
            id: sharedLink.id,
            url: `${req.protocol}://${req.get('host')}/videos/share/${sharedLink.url}`,
            expiresAt: sharedLink.expiresAt,
          });

          res.sendStatus(200);
        } catch (e) {
          console.error(e);
          next(new InternalServerError());
        }
      },
    ];
  }

  getLink() {
    const paramsSchema = z.object({ linkId: z.string() });
    type IParams = z.infer<typeof paramsSchema>;

    return [
      validateRequestParams(paramsSchema),
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const { linkId } = req.body as unknown as IParams;

          const shareLink = await this.ctx.db.client.shareLink.findFirst({
            where: { url: linkId },
            include: { video: true },
          });

          if (!shareLink) {
            return res.status(404).json({ error: 'Share link not found' });
          }

          if (new Date() > shareLink.expiresAt) {
            return res.status(410).json({ error: 'Share link has expired' });
          }

          res.download(`${getEnvVar('STORAGE_PATH')}/${shareLink.video.filePath}`);
        } catch (e) {
          console.error(e);
          next(new InternalServerError());
        }
      },
    ];
  }
}

export default VideoController;
