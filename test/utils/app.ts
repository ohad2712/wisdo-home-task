import mongoose, { Types } from 'mongoose';
import { Roles } from '../../src/globals';

import { CommunityModel, PostModel, UserModel } from '../../src/models';

export function generatePosts(posts: Array<{
  _id?: Types.ObjectId;
  title?: string;
  summary?: string;
  body?: string;
  community?: Types.ObjectId;
  author?: Types.ObjectId;
  likes?: number;
  status?: string;
}>): Promise<PostModel[]> {
  const postModels = posts.map((post) => {
    return new PostModel(post);
  });
  
  return PostModel.create(postModels);
}

export function generateUsers(users: Array<{
  _id?: Types.ObjectId;
  name?: string;
  role?: Roles.MODERATOR | Roles.SUPER_MODERATOR;
  email?: string;
  image?: string;
  country?: string;
  communities?: Types.ObjectId[];
}>): Promise<mongoose.Document[]> {
  const userModels = users.map((user) => {
    return new UserModel(user);
  });
  
  return UserModel.create(userModels);
}


export function generateCommunities(communities: Array<{
  _id?: Types.ObjectId;
  title?: string;
  image?: string;
  memberCount?: number;
}>): Promise<mongoose.Document[]> {
  const communityModels = communities.map((community) => {
    return new CommunityModel(community);
  });
  
  return CommunityModel.create(communityModels);
}

