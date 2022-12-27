import { newRouter } from '../createRouter';
import { createPost } from '../../controllers/app';

export const router = newRouter();

router.post('/posts', createPost); // TODO: create router for each entity
