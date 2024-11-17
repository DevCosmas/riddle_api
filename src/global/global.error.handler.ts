import { Request, Response, NextFunction } from 'express';
import AppError from './app.error';

const handleTokenExpire = (res: Response) => {
  return new AppError('kindly login again', 400);
};

const handleCastError = (err: any) => {
  const value = err.error.value;
  const message = `${value} is an Invalid Input`;
  return new AppError(message, 400);
};

const handleDuplicateFields = (err: any) => {
  const value = err.message.match(/(["'])(?:\\.|[^\\])*?\1/)[0];
  const refinedValue = value.split('"')[1];
  const message = `${refinedValue} is already taken`;
  return new AppError(message, 400);
};

const handleValidatorError = (err: any) => {
  const message = err.message.split(':')[2];
  return new AppError(message, 400);
};

const handleJwtError = (err: any) => {
  const message = err.error.message;
  return new AppError(message, 400);
};

const sendErrorDev = (error: any, res: Response) => {
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    stack: error.stack,
    error,
  });
};

const sendErrorProd = (error: any, res: Response) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    console.error(error);
    res
      .status(500)
      .json({ status: 'error', message: 'Unexpected Error occurred' });
  }
};
const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === 'production') {
    let err = { ...error };
    err.message = error.message;

    if (error.error.name === 'CastError') err = handleCastError(error);
    if (error.error.code === 11000) err = handleDuplicateFields(error);
    if (error.error.name === 'ValidationError')
      err = handleValidatorError(error);
    if (error.error.name === 'JsonWebTokenError') err = handleJwtError(error);
    if (error.error.name === 'TokenExpiredError') err = handleTokenExpire(res);

    sendErrorProd(err, res);
  }
  next();
};

export default errorHandler;
