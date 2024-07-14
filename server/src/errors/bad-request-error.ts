import { CustomError } from 'errors/custom-error';

export class FileValidationError extends CustomError {
  statusCode = 400;

  constructor(public error: string) {
    super(`Bad Request: ${error}`);
    Object.setPrototypeOf(this, FileValidationError.prototype);
  }

  serializeErrors() {
    return [{ message: this.error }];
  }
}
