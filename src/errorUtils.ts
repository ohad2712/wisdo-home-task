import { NextFunction, Request, Response } from 'express';

export class CustomError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function errorHandler(error: any, request: Request, response: Response, next: NextFunction) {
  // Set the status code and message of the error
  const statusCode = error.status || error.statusCode || 500; // TODO: use a lib with status codes instead of 500
  const message = error.message || 'An unknown error occurred';

  // Send the error response
  response.status(statusCode).send({ message });
}
