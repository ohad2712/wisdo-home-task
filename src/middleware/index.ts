/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

import type * as express from 'express';

export const middleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  next();
};

export default middleware;
