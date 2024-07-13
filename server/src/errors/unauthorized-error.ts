import { CustomError } from 'errors/custom-error';

export class UnauthorizedError extends CustomError {
  statusCode = 401;
  reason = 'Unauthorized';

  constructor() {
    super('Unauthorized');
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }

  serializeErrors(): { message: string; field?: string | undefined }[] {
    return [{ message: this.reason }];
  }
}
