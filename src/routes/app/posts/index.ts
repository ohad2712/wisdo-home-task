import { newRouter } from '../../createRouter';
import { createPost, getPost } from '../../../controllers/posts';

export const router = newRouter();

router.post('/', createPost);
router.get('/:id', getPost);
