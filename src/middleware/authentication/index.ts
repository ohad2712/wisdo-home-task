import { Request, Response, NextFunction } from 'express';
import mongoose, { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';


import { CustomError } from '../../errorUtils';

import { IGetUserAuthInfoRequest } from '../../types';
import { getUserById } from '../../services/users';

const defaultMongodbUri = 'mongodb://localhost:27017/my-db';

// Dummy middleware function for fetching a user ID
export async function fetchUserIdMiddleware (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // Cast the request to the IGetUserAuthInfoRequest type, as changing the 
    // fetchUserIdMiddleware signature would cause a type issue when 
    // `app.use()`-ing the middleware in the express.js app starting up.
    const customReq = req as IGetUserAuthInfoRequest;

    // Connect to the MongoDB database using Mongoose
    // This header is just for test usages
    const mongodbUri = customReq.headers?.mongodburi as string || null;
    await mongoose.connect(process?.env?.MONGODB_URI || mongodbUri || defaultMongodbUri);

    // Find the user in the database using the provided user ID
    const userId = (customReq.headers?.userid as unknown) as Types.ObjectId;
    const user = await getUserById(userId);
    
    // If the user is not found, return an error
    if (!user) {
      return res.send(new CustomError(StatusCodes.BAD_REQUEST, 'Invalid user ID'));
    }

    // If the user is found attach to the request and confirm with the `next` function
    customReq.user = user;

    return next();
  } catch (error) {
    res.send(new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error connecting to the database'));
  }
};
