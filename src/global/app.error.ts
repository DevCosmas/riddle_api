class AppError extends Error {
  statusCode: number;
  result: string;
  isOperational: boolean;
  error: string;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.result = `${statusCode}`.startsWith('4') ? 'FAIL' : 'error';
    this.isOperational = true;
    this.error = message;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
