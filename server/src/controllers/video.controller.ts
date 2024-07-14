import { InternalServerError } from 'errors/internal-server-error';
import { Request, Response, NextFunction } from 'express';
import AbstractController from './index.controller';
import z from 'zod';
import { storageMiddleware } from 'middlewares/storage.middleware';
import { validateRequestBody } from 'validators/validateRequest';
import { BadRequestError } from 'errors/bad-request-error';
import { NotFoundError } from 'errors/not-found-error';
import getEnvVar from 'env/index';
import { getFileLocation } from 'utils';
import Clipper from 'libs/clipper.lib';
import { stat } from 'fs/promises';

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
            const { id } = req.params as unknown as IParams;
            const video = await this.ctx.db.client.video.findUnique({
                where: {
                    id
                }
            });

            if (!video) {
                return res.status(404).json({ msg: 'Video not found' });
            }

            if (video.userId != req.user.id) {
                return res.status(403).json({ msg: "Access Forbidden" });
            }

            res.status(201).json({ data: video });
            try {    
            } catch (e) {
                console.error(e);
                next(new InternalServerError());
            }
        }
    ];
   }

  upload() {
    return [
      storageMiddleware(this.config),
      async (req: Request, res: Response, next: NextFunction) => {
        try {
            const file = req.file as unknown as Express.Multer.File;
            
            if (!file) {
                return next(new BadRequestError('File not found'));
            }

            await Clipper.validate(file.path);
            
            await this.ctx.db.client.video.create({
                data: {
                    userId: req.user.id,
                    title: file.filename,
                    size: file.size,
                    duration: 12,
                    filePath: `${req.user.id}/${file.filename}`
                }
            });

            res.sendStatus(201);
        } catch (e: unknown) {
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
        validateRequestBody(paramsSchema),
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
                }
            });

            if (!video) {
                return next(new NotFoundError());
            }

            if (video.userId != req.user.id) {
                return res.status(403).json({ msg: "Access Forbidden" });
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

            const inputPath = `${getEnvVar("STORAGE_PATH")}/${video.filePath}`;
            const newVideoName = `${Date.now()}-${video.title}`;
            const outputPath = getFileLocation(req.user.id) + newVideoName;
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
                }
            });

            console.log(newVideo);

            res.sendStatus(200);
        } catch (e) {
          console.error(e);
          next(new InternalServerError());
        }
      },
    ];
  }

  merge() {
    return [
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          console.log(req);
          res.sendStatus(200);
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
                    id
                }
            });

            if (!video) {
                return res.status(404).json({ msg: 'Video not found' });
            }

            if (video.userId != req.user.id) {
                return res.status(403).json({ msg: "Access Forbidden" });
            }

            await this.ctx.db.client.video.delete({
                where: {
                    id
                }
            });

            res.sendStatus(204);
        } catch (e) {
          console.error(e);
          next(new InternalServerError());
        }
      },
    ];
  }
}

export default VideoController;
