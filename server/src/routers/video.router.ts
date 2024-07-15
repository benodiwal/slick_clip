import VideoController from 'controllers/video.controller';
import AbstractRouter from './index.router';
import isAuthenticated from 'middlewares/isAuthenticated.middleware';

class VideoRouter extends AbstractRouter {
  registerMiddlewares() {
    return [isAuthenticated];
  }

  registerRoutes(): void {
    const videoController = new VideoController(this.ctx, this.config);
    this.registerGET('/', videoController.get());
    this.registerGET('/:id', videoController.getVideoById());
    this.registerPOST('/upload', videoController.upload());
    this.registerPOST('/:id/trim', videoController.trim());
    this.registerPOST('/merge', videoController.merge());
    this.registerDELETE('/:id', videoController.delete());
    this.registerPOST('/:id/share', videoController.createLink());
    this.registerGET('/share/:linkId', videoController.getLink());
  }
}

export default VideoRouter;
