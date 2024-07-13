import HealthController from 'controllers/health.controller';
import AbstractRouter from './index.router';

class HealthRouter extends AbstractRouter {
  registerRoutes(): void {
    const healthController = new HealthController();
    this.registerGET('/', healthController.get());
  }
}

export default HealthRouter;
