import VideoConfig from 'configs/video.config';
import { Router, Express, Handler, Response, Request, RequestHandler } from 'express';
import { IContext } from 'interfaces/database';

export default abstract class AbstractRouter {
  #router: Router;
  #engine: Express;
  #path: string;
  ctx: IContext;
  config: VideoConfig;

  constructor(ctx: IContext, engine: Express, path: string, config: VideoConfig) {
    this.#router = Router();
    this.#engine = engine;
    this.#path = path;
    this.ctx = ctx;
    this.config = config;
  }

  register() {
    console.log(`\nregistering ${this.constructor.name} | path: ${this.#path}`);
    const middlewares = this.registerMiddlewares();
    for (const middleware of middlewares) {
      this.#router.use(middleware(this.ctx));
    }
    this.registerHealthRoutes();
    this.registerRoutes();
    this.#engine.use(this.#path, this.#router);
  }

  registerGET(path: string, handlers: Handler[]) {
    console.log(`registered: GET ${this.#path}${path}`);
    this.#router.get(path, handlers);
  }

  registerPOST(path: string, handlers: Handler[]) {
    console.log(`registered: POST ${this.#path}${path}`);
    this.#router.post(path, handlers);
  }

  registerPUT(path: string, handlers: Handler[]) {
    console.log(`registered: PUT ${this.#path}${path}`);
    this.#router.put(path, handlers);
  }

  registerDELETE(path: string, handlers: Handler[]) {
    console.log(`registered: DELETE ${this.#path}${path}`);
    this.#router.delete(path, handlers);
  }

  health(_: Request, res: Response) {
    res.sendStatus(200);
  }

  registerHealthRoutes() {
    this.registerGET('/health', [this.health]);
  }

  abstract registerMiddlewares(): HandlerWithProps[];
  abstract registerRoutes(): void;
}

type HandlerWithProps = (ctx: IContext) => RequestHandler;
