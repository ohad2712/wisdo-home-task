import { Types } from 'mongoose';

import { PostModel } from '../../models';

export async function getPostById(id: Types.ObjectId) {
  return await PostModel.findById(id);
}

// This function retrieves all posts that belong to one of 
// the user's communities, then sorts the query results by 'author.country' 
// first, and then by the 'likes' in a descending order
export async function retrieveAllPostsForCommunities (
  userCommunities: Types.ObjectId[]
): Promise <PostModel[]> {
  const posts = await PostModel.find({
    community: { $in: userCommunities },
  }).populate({
    path: 'author',
    select: 'country'
  }).sort({
    'author.country': 1,
    likes: -1,
  });

  return posts;
}
