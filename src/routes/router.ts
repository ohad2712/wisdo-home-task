import { Response, Router } from 'express';

import { router as appRouter } from './app';


const router = Router();

router.get('/systemcheck', (_, res: Response) => {
  return res.send({
    message: 'Server is running :)',
  });
});

router.use('/app', appRouter);

export default router;
