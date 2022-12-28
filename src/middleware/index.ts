import type * as express from 'express';

export const middleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  // A placeholder for any middleware needed
  next();
};

export default middleware;
