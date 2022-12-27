import {
  Model,
  Schema,
  model,
  Types,
} from 'mongoose';

import type { Post, Community, User } from '../types';


export type PostModel = Document & Post;
export type CommunityModel = Document & Community;
export type UserModel = Document & User;

const postSchema = new Schema({
  title: {
    type: String,
    maxlength: 60,
  },
  summary: {
    type: String,
    maxlength: 150,
  },
  body: {
    type: String,
  },
  author: {
    type: Types.ObjectId,
    ref: 'User',
  },
  community: {
    type: Types.ObjectId,
    ref: 'Community',
  },
  likes: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['Pending approval', 'Approved'],
  },
});

const communitySchema = new Schema({
  title: {
    type: String,
    maxlength: 60,
  },
  image: {
    type: String,
  },
  memberCount: {
    type: Number,
  },
});

const userSchema = new Schema({
  name: {
    type: String,
  },
  role: {
    type: String,
    enum: ['super moderator', 'moderator'],
  },
  email: {
    type: String,
  },
  image: {
    type: String,
  },
  country: {
    type: String,
  },
  communities: [{
    type: Types.ObjectId,
    ref: 'Community',
  }],
});

export const PostModel: Model<PostModel> = model<PostModel>('Post', postSchema);
export const CommunityModel: Model<CommunityModel> = model<CommunityModel>('Community', communitySchema);
export const UserModel: Model<UserModel> = model<UserModel>('User', userSchema);
