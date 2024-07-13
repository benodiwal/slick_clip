import { ZodError } from 'zod';
import { CustomError } from 'errors/custom-error';

export class RequestValidationError extends CustomError {
  statusCode = 400;

  constructor(public errors: ZodError) {
    super('Invalid request parameters');
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    return this.errors.issues.map((issue) => {
      return { message: issue.message, field: issue.path.join('.') };
    });
  }
}
