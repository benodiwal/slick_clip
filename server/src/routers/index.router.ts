import { Router, Express, Handler, Response, Request } from 'express';

export default abstract class AbstractRouter {
  #router: Router;
  #engine: Express;
  #path: string;

  constructor(engine: Express, path: string) {
    this.#router = Router();
    this.#engine = engine;
    this.#path = path;
  }

  register() {
    console.log(`\nregistering ${this.constructor.name} | path: ${this.#path}`);
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

  abstract registerRoutes(): void;
}
