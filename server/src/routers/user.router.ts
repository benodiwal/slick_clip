import AbstractRouter from './index.router';
import UserController from 'controllers/user.controller';

class UserRouter extends AbstractRouter {
  registerMiddlewares() {
    return [];
  }

  registerRoutes(): void {
    const userController = new UserController(this.ctx);
    this.registerGET('/:id', userController.get());
    this.registerPOST('/', userController.create());
  }
}

export default UserRouter;
