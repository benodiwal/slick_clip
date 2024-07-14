import VideoController from "controllers/video.controller";
import AbstractRouter from "./index.router";
import isAuthenticated from "middlewares/isAuthenticated.middleware";

class VideoRouter extends AbstractRouter {

    registerMiddlewares() {
        return [isAuthenticated];
    }

    registerRoutes(): void {
        const videoController = new VideoController(this.ctx);
        this.registerGET('/', videoController.get());
        this.registerPOST('/upload', videoController.upload());
        this.registerPOST('/trim', videoController.upload());
        this.registerPOST('/merge', videoController.upload());
        this.registerDELETE('/:id', videoController.delete());
    }
}

export default VideoRouter;
