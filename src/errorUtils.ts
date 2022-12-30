import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class CustomError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function errorHandler(error: any, request: Request, response: Response, next: NextFunction) {
  // Set the status code and message of the error
  const statusCode = error.status || error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = error.message || 'An unknown error occurred';

  // Send the error response
  response.status(statusCode).send({ message });
}
