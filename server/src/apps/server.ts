import express, { Express } from 'express';
import getEnvVar from 'env/index';
import logger from 'middlewares/logger.middleware';
import error from 'middlewares/error.middleware';
import HealthRouter from 'routers/health.router';
import VideoRouter from 'routers/video.router';
import { IDatabase } from 'interfaces/database';
import Context from 'database/Context';
import path from 'path';
import VideoConfig from 'configs/video.config';
import UserRouter from 'routers/user.router';

class Server {
  #engine: Express;
  db: IDatabase;
  config: VideoConfig;

  constructor(database: IDatabase) {
    this.db = database;
    this.#engine = express();

    const configFilePath = path.join(__dirname, '..', '..', 'config.yaml');
    console.log(configFilePath);
    this.config = VideoConfig.fromFile(configFilePath);
  }

  #registerMiddlwares() {
    this.#engine.use(express.json());
    this.#engine.use(logger());
  }

  #registerHandlers() {
    const ctx = new Context(this.db);

    const healthRouter = new HealthRouter(ctx, this.#engine, '');
    const userRouter = new UserRouter(ctx, this.#engine, '/user');
    const videoRouter = new VideoRouter(ctx, this.#engine, '/video');
    
    healthRouter.register();
    userRouter.register();
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
