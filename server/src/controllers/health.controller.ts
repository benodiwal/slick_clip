import { Request, Response } from 'express';
import AbstractController from './index.controller';

class HealthController extends AbstractController {
  get() {
    return [
      async (_req: Request, res: Response) => {
        res.sendStatus(200);
      },
    ];
  }
}

export default HealthController;
