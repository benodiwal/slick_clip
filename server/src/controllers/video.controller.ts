import { InternalServerError } from 'errors/internal-server-error';
import { Request, Response, NextFunction } from 'express';
import AbstractController from './index.controller';
import z from 'zod';
import { storageMiddleware } from 'middlewares/storage.middleware';

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
          console.log(req);
          res.sendStatus(200);
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
    return [
      async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as unknown as IParams;
            console.log(id);
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
