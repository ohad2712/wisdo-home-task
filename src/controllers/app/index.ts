import { NextFunction, Request, Response } from 'express';

import { CustomError } from '../../errorUtils';
import { CommunityModel, PostModel, UserModel } from '../../models';
import { getAllModeratorsAndSuperModerators } from '../../services/user';

import type { Community, Post, User } from '../../types';

export async function createPost (req: Request, res: Response, next: NextFunction) {
  const { author, community, post } = req.body;
  let authorUserObj: User | null;
  let communityObj: Community | null;

  try {
    // TODO: Move all queries to services
    authorUserObj = await UserModel.findById(author);
    communityObj = await CommunityModel.findById(community);
    
    if(!authorUserObj || !communityObj) {
      return next(new Error(`The post\'s author (${author}) and/or community (${community}) were not found`));
    }
  } catch (err) {
    console.error('Error occurred while trying to find the author or the community for the current post', err);
  }

  // Check that the user is a member of the community
  if (!(authorUserObj!).communities.includes(community)) {
    return next(new CustomError(403 ,`User is not a member of community: ${community.name}`)); // TODO: add an error handling middleware to catch all uncaught errors, like this one
  }

  // If the "summary" field is not present, generate it from the first 100 words of the `body` field
  if (!post.summary) {
    const words = post.body.split(' ');
    post.summary = words.slice(0, 100).join(' ');
  }

  try {
    // Save the post to the database
    const postObject = await savePostToDatabase(post);

    scanPostAndSendAlertEmail(postObject);

    res.send(postObject);
  } catch (err) {
    return next(new CustomError(400 ,`An error has occurred during the save of a new post: ${err}`));
  }
}

export async function getPost (req: Request, res: Response) {
  const postId = req.params.id;
  let post: Post | null;

  // Fetch the desired post from the database using the postId
  try {
    post = await PostModel.findById(postId);

    // Return the post in the response
    res.status(200).send(post);
  } catch (err) {
    res.status(500).send(err);
  }
}

async function savePostToDatabase (post: Post): Promise<PostModel> {
  const postObject = new PostModel(post);
  
  await postObject.save();

  return postObject;
}

async function scanPostAndSendAlertEmail(post: PostModel) {
  // This can be another collection in the DB as well, but for the purpose of this exercise I'll have stored in-memory
  const watchListWords = ['danger', 'warning', 'alert'];
  
  // Check if the saved post contains any watch list words
  for (const word of watchListWords) {
    if (post.title.toLowerCase().includes(word) || post.body.toLowerCase().includes(word)) {
      // Send email alert to moderators
      const emailBody = `A new post has been added that includes the watch list word "${word}".\nView the post at: http://localhost:${process?.env?.PORT || 8080}/app/posts/${post._id}`;
      const moderatorsAndSuperModeratorsEmailAdrresses = await getAllModeratorsAndSuperModerators();
      sendEmail(moderatorsAndSuperModeratorsEmailAdrresses, 'Watch List Alert', emailBody);
      
      break;
    }
  }
}

export function sendEmail(to: string[], subject: string, body: string) {
  console.log('sendEmail called', {to, subject, body});
}
