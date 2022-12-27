import { newRouter } from '../createRouter';
import { createPost, getPost } from '../../controllers/app';

export const router = newRouter();

router.post('/posts', createPost); // TODO: create router for each entity
router.get('/posts/:id', getPost);
