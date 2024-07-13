import { InternalServerError } from 'errors/internal-server-error';
import { RequestValidationError } from 'errors/request-validation-error';
import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validateRequestQuery = (schema: AnyZodObject) => {
  return async (req: Request, _: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        return next(new RequestValidationError(e));
      }
      next(new InternalServerError());
    }
  };
};

export const validateRequestBody = (schema: AnyZodObject) => {
  return async (req: Request, _: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        return next(new RequestValidationError(e));
      }
      next(new InternalServerError());
    }
  };
};
