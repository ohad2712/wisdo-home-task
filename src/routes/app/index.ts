import { newRouter } from '../createRouter';
import { router as postsRouter } from './posts';

export const router = newRouter();

router.use('/posts', postsRouter);
