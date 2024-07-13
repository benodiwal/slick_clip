import { CustomError } from 'errors/custom-error';

export class InternalServerError extends CustomError {
  statusCode = 500;
  reason = 'Internal server error';

  constructor() {
    super('Internal server error');
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }

  serializeErrors(): { message: string; field?: string | undefined }[] {
    return [{ message: this.reason }];
  }
}
