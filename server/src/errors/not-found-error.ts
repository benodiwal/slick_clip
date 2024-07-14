import { CustomError } from 'errors/custom-error';

export class NotFoundError extends CustomError {
  statusCode = 404;
  reason = 'Not found';

  constructor(reason?: string) {
    super(reason !== undefined ? reason : 'Not found');
    if (reason !== undefined) {
      this.reason = reason;
    }
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors(): { message: string; field?: string | undefined }[] {
    return [{ message: this.reason }];
  }
}
