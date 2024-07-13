import { UserSession } from 'types/session.types';

declare global {
  namespace Express {
    interface Request {
      session: UserSession;
    }
  }
}
