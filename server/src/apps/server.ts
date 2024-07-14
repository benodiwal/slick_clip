import express, { Express } from 'express';
import getEnvVar from 'env/index';
import logger from 'middlewares/logger.middleware';
import error from 'middlewares/error.middleware';
import HealthRouter from 'routers/health.router';
import VideoRouter from 'routers/video.router';
import { IDatabase } from 'interfaces/database';
import Context from 'database/Context';

class Server {
  #engine: Express;
  db: IDatabase;

  constructor(database: IDatabase) {
    this.db = database;
    this.#engine = express();
  }

  #registerMiddlwares() {
    this.#engine.use(express.json());
    this.#engine.use(logger());
  }

  #registerHandlers() {
    const ctx = new Context(this.db);

    const healthRouter = new HealthRouter(ctx, this.#engine, '');
    const videoRouter = new VideoRouter(ctx, this.#engine, '/video');
    
    healthRouter.register();
    videoRouter.register();
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
