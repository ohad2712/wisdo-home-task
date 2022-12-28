import { newRouter } from '../createRouter';
import { router as postsRouter } from './posts';
import { router as usersRouter } from './users';

export const router = newRouter();

router.use('/posts', postsRouter);
router.use('/users', usersRouter);
