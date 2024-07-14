import VideoController from "controllers/video.controller";
import AbstractRouter from "./index.router";
import isAuthenticated from "middlewares/isAuthenticated.middleware";

class VideoRouter extends AbstractRouter {

    registerMiddlewares() {
        return [isAuthenticated];
    }

    registerRoutes(): void {
        const videoController = new VideoController(this.ctx);
        this.registerPOST('/', videoController.upload());
    }
}

export default VideoRouter;
