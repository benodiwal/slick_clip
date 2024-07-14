import HealthController from 'controllers/health.controller';
import AbstractRouter from './index.router';

class HealthRouter extends AbstractRouter {
  registerMiddlewares() {
    return [];
  }

  registerRoutes(): void {
    const healthController = new HealthController(this.ctx, this.config);
    this.registerGET('/', healthController.get());
  }
}

export default HealthRouter;
