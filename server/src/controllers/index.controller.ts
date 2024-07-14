import VideoConfig from 'configs/video.config';
import { IContext } from 'interfaces/database';

export default abstract class AbstractController {
  ctx: IContext;
  config: VideoConfig;
  constructor(ctx: IContext, config: VideoConfig) {
    this.ctx = ctx;
    this.config = config;
  }
}
