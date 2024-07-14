import VideoController from "controllers/video.controller";
import AbstractRouter from "./index.router";

class VideoRouter extends AbstractRouter {
    registerRoutes(): void {
        const videoController = new VideoController(this.ctx);
        this.registerPOST('/', videoController.upload());
    }
}

export default VideoRouter;
