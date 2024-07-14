import { IContext } from 'interfaces/database';

export default abstract class AbstractController {
  ctx: IContext;
  constructor(ctx: IContext) {
    this.ctx = ctx;
  }
}
