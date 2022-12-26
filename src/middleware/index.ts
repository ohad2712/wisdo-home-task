/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

import type * as express from 'express';

export const middleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  console.log('In middleware function');
  next();
};

export default middleware;
