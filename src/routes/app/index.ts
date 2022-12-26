import { newRouter } from '../createRouter';
import { myHandler } from '../../controllers/app';

export const router = newRouter();

router.get('/myRoute', myHandler);
