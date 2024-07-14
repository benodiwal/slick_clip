import { InternalServerError } from "errors/internal-server-error";
import { Request, Response, NextFunction } from  "express";
import AbstractController from "./index.controller";

class VideoController extends AbstractController {
    upload() {
        return [
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    console.log(req);
                    res.sendStatus(200);
                } catch (e: unknown) {
                    console.error(e);
                    next(new InternalServerError());
                }
            }
        ];
    }
}

export default VideoController;
