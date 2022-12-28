import { newRouter } from '../../createRouter';
import { getRecommendedFeed } from '../../../controllers/users';

export const router = newRouter();

router.get('/:id/feed', getRecommendedFeed);
