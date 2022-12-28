import type { Request } from 'express';

import { Community, Post, User } from '../../types';

export interface CreatePostBody extends Request<{}, {}, {}> {
  user: User; 
  community: Community;
  post: Post;
};
