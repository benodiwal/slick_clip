import { CustomError } from 'errors/custom-error';
import { NextFunction, Request, Response } from 'express';

const error = () => {
  return (err: CustomError, _: Request, res: Response, ___: NextFunction) => {
    return res.status(err.statusCode).json({ code: err.statusCode, reasons: err.serializeErrors() });
  };
};

export default error;
