import { newRouter } from '../../createRouter';
<<<<<<< HEAD
import { getRecommendedFeed } from '../../../controllers/users';
=======
import { getRecommendedFeed } from '../../../controllers/app/users';
>>>>>>> 6820d94... feat: add basic functionality to GET /users/:id/feed

export const router = newRouter();

router.get('/:id/feed', getRecommendedFeed);
