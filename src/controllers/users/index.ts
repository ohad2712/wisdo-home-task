import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';

import { PostModel } from '../../models';
import { retrieveAllPostsForCommunities } from '../../services/posts';
import { getUserById } from '../../services/users';

export async function getRecommendedFeed(
  req: Request,
  res: Response,
) {
  // Extract the user ID parameter from the request
  const { id } = req.params;

  // Fetch the user's communities
  const user = await getUserById((id as unknown) as Types.ObjectId);
  if (!user) {
    // Return a 404 (Not Found) error if the user was not found
    res.sendStatus(StatusCodes.NOT_FOUND);
    return;
  }

  const userCommunities = user.communities;
  
  const posts = await retrieveAllPostsForCommunities(userCommunities);

  // Sort the posts based on the criteria
  // Then return the sorted list of posts
  res.json(sortPosts(posts, user.country));
}

export function sortPosts (posts: PostModel[], userCountry?: string) {
  posts.sort((a, b) => {
    if ((a.author as any)?.country === (b.author as any)?.country) {
      // Calculate the weighted score for each post
      const aWeightedScore = getPostWeightedScore(a);
      const bWeightedScore = getPostWeightedScore(b);

      // Sort posts by descending weighted score
      return bWeightedScore - aWeightedScore;
    } else {
      // Sort posts by country first
      return (a.author as any)?.country === userCountry ? -1 : 1;
    }
  });

  return posts;
}

const getPostWeightedScore = (post: PostModel) => 0.8 * post.likes + 0.2 * post.body.length;
