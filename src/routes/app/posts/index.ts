import { newRouter } from '../../createRouter';
<<<<<<< HEAD
import { createPost, getPost } from '../../../controllers/posts';
=======
import { createPost, getPost } from '../../../controllers/app/posts';
>>>>>>> 6820d94... feat: add basic functionality to GET /users/:id/feed

export const router = newRouter();

router.post('/', createPost);
router.get('/:id', getPost);
