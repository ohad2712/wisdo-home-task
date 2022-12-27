import { newRouter } from '../../createRouter';
import { createPost, getPost } from '../../../controllers/app';

export const router = newRouter();

router.post('/', createPost);
router.get('/:id', getPost);
