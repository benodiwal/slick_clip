import express, { Express } from 'express';
import getEnvVar from 'env/index';
import logger from 'middlewares/logger.middleware';
import error from 'middlewares/error.middleware';
import HealthRouter from 'routers/health.router';

class Server {
  #engine: Express;

  constructor() {
    this.#engine = express();
  }

  #registerMiddlwares() {
    this.#engine.use(express.json());
    this.#engine.use(logger());
  }

  #registerHandlers() {
    const healthRouter = new HealthRouter(this.#engine, '');
    healthRouter.register();
  }

  start() {
    this.#registerMiddlwares();
    this.#registerHandlers();
    this.#engine.use(error());
    this.#engine.listen(parseInt(getEnvVar('PORT')), () => {
      console.log(`\nServer listening on ${getEnvVar('PORT')}`);
    });
  }
}

export default Server;
