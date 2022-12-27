// Generic types and interfaces to be used anywhere around the codebase
import { Request } from 'express';
import { Types } from 'mongoose';

export interface IGetUserAuthInfoRequest extends Request {
  user: User
}

export interface Post {
  _id?: Types.ObjectId;
  title: string;
  summary: string;
  body: string;
  author: Types.ObjectId;
  community: Types.ObjectId;
  likes: number;
  status: 'Pending approval' | 'Approved';
}

export interface Community {
  _id?: Types.ObjectId;
  title: string;
  image: string;
  memberCount: number;
}

export interface User {
  _id?: Types.ObjectId;
  name: string;
  role?: 'super moderator' | 'moderator';
  email?: string;
  image?: string;
  country: string;
  communities: Types.ObjectId[];
}
