import { Request, Response } from 'express';

export const myHandler = (req: Request, res: Response) => {
  res.send({ yay: true });
};
