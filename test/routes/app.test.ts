import request from 'supertest';
// import express from 'express';
import mongoose, { Types } from 'mongoose';

import app from '../../src/app';
import { fetchUserIdMiddleware } from '../../src/middleware/authentication';
import { NextFunction, Request, Response } from 'express';
import { CommunityModel, PostModel, UserModel } from '../../src/models';
import { disconnectFromDb } from '../../src/dbUtils';
import * as userService from '../../src/services/user';

const mongodbUri = 'mongodb://localhost:27017/test';
// Arrange

describe('App routes', () => {
  beforeAll(async ()=> {
    // Disconnect any existing DB instances before starting
    await disconnectFromDb();
    await mongoose.connect(mongodbUri);
  });

  beforeEach(async () => {
    // TODO: edit connectToDb to do an async function so that we can await it here
    // connectToDb(mongodbUri);
    mongoose.connection.useDb('test');
  });

  afterEach(async () => {
    // Delete all users, communities, and posts from the database
    await UserModel.remove({});
    await CommunityModel.remove({});
    await PostModel.remove({});
  });

  afterAll(async () => {
    await disconnectFromDb();
  });

  describe('GET /systemcheck', () => {
    it('should respond with success message', async () => {
      // Arrange
      const user = new UserModel({
        name: 'Ohad',
        communities: [],
      });
      await user.save();

      // Act
      const response = await request(app)
        .get('/systemcheck')
        .set({
          mongodburi: mongodbUri,
          userid: user._id,
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Server is running :)',
      });
    });
  });

  describe('GET /posts/:id', () => {
    let user;
    let post;

    beforeEach(async () => {
      // Adding a user for the sake of authenticating
      user = new UserModel({
        name: 'Ohad',
        communities: [],
      });

      await user.save();

      post = new PostModel({
        title: 'Test title',
        summary: 'Test summary',
        body: 'Test body',
      });
      
      await post.save(); 
    });

    afterEach(async () => {
      // Delete all posts and users from the database
      await PostModel.remove({});
      await UserModel.remove({});
    });

    it('should return a post if it exists', async () => {    
      // Act
      const response = await request(app)
        .get(`/app/posts/${post._id}`)
        .set({
          mongodburi: mongodbUri,
          userid: user._id,
        });
  
      // Assert
      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Test title');
      expect(response.body.summary).toBe('Test summary');
      expect(response.body.body).toBe('Test body');
    });
  
    it('should return an empty object if the post does not exist', async () => {
      // Arrange
      // Generate a non existing post ObjectId
      const notExistingPostId = new Types.ObjectId();
      console.log(post._id);
      
      // Act
      const response = await request(app)
        .get(`/app/posts/${notExistingPostId}`)
        .set({
          mongodburi: mongodbUri,
          userid: user._id,
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({});
    });
  });

  describe('POST /posts', () => {
    it('should allow a user to create a post in one of his communities', async () => {    
      // Arrange
      const user = new UserModel({
        name: 'Ohad',
        communities: [],
      });
      const community = new CommunityModel({
        title: 'Test Community',
      });
      await user.save();
      await community.save();
  
      // Add the community to the user's communities list
      user.communities.push(community._id);
      await user.save();
  
      // Act
      const response = await request(app)
        .post('/app/posts')
        .send({
          post: {
            title: 'Test Post',
            summary: 'This is a test post summary',
            body: 'This is a test post body',
          },
          community: community._id,
          author: user._id,
        })
        .set({
          mongodburi: mongodbUri,
          userid: user._id,
        });
  
      // Assert
      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Test Post');
      expect(response.body.summary).toBe('This is a test post summary');
      expect(response.body.body).toBe('This is a test post body');
    });
  
    it('should not allow a user to upload a post to a community they are not a member of', async () => {
      // Arrange
      const user = new UserModel({
        name: 'Ohad',
        communities: [],
      });
      const foreignCommunity = new CommunityModel({
        title: 'Unlinked Community',
      });
      const familiarCommunity = new CommunityModel({
        title: 'Linked To User Community',
      });
      
      await user.save();
      await foreignCommunity.save();
      await familiarCommunity.save();
    
      // Add the familiar community to the user's communities list
      user.communities.push(familiarCommunity._id);
      await user.save();
    
      // Act
      // Send the foreign and unlinked community to the endpoint
      const response = await request(app)
        .post('/app/posts')
        .send({
          post: {
            title: 'Test Post',
            summary: 'This is a test post summary',
            body: 'This is a test post body',
          },
          community: foreignCommunity._id,
          author: user._id,
        })
        .set({
          mongodburi: mongodbUri,
          userid: user._id,
        });
    
      // Assert
      expect(response.status).toBe(403);
    });
  
    it('should generate a summary from the body if it is not provided', async () => {
      // Arrange
      const user = new UserModel({
        name: 'Ohad',
        communities: [],
      });
      const community = new CommunityModel({
        title: 'Test Community',
      });
      await user.save();
      await community.save();
    
      // Add the community to the user's communities list
      user.communities.push(community._id);
      await user.save();
    
      const post = {
        title: 'Test post',
        body: 'This is a test post with more than 100 words. The system should generate a summary by selecting the first 100 words of the body.',
      };
    
      // Act
      const response = await request(app)
      .post('/app/posts')
      .send({
        post,
        community: community._id,
        author: user._id,
      })
      .set({
        mongodburi: mongodbUri,
        userid: user._id,
      });
    
      // Assert
      expect(response.status).toBe(200);
      expect(response.body.summary).toBe('This is a test post with more than 100 words. The system should generate a summary by selecting the first 100 words of the body.');
    });

    describe('Content watching detected alert', () => {
      beforeEach(() => {
        jest.resetAllMocks();
      });

      it('should send an email alert for watchlist words that exist in the created post', async () => {
        // Arrange
        const user = new UserModel({
          name: 'Ohad',
          communities: [],
        });
        const community = new CommunityModel({
          title: 'Test Community',
        });
        await user.save();
        await community.save();
    
        // Add the community to the user's communities list
        user.communities.push(community._id);
        await user.save();

        const watchlistedWordExample = 'danger';
        const post = {
          title: 'Test post',
          body: `This post contains a watchlist word, such as '${watchlistedWordExample}'`,
        };
        const moderatorEmailAddresses = [
          'moderator1@email.com',
          'super_moderator@email.com',
        ]; 

        // Set mock for moderators find
        jest.spyOn(userService, 'getAllModeratorsAndSuperModerators')
          .mockResolvedValue(moderatorEmailAddresses);

        const spy = jest.spyOn(console, 'log');
  
        // Act
        const response = await request(app)
          .post('/app/posts')
          .send({
            post,
            community: community._id,
            author: user._id,
          })
          .set({
            mongodburi: mongodbUri,
            userid: user._id,
          });

        // Assert
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith('sendEmail called',{
          to: moderatorEmailAddresses,
          subject: 'Watch List Alert',
          body: `A new post has been added that includes the watch list word "${watchlistedWordExample}".\nView the post at: http://localhost:${process?.env?.PORT || 8080}/app/posts/${response.body._id}`,
        });
      });
    });
  
  // // Feed relevance functionality
  // it('feed is ranked by relevance score in descending order', async () => {
  //   const userId = fetchDummyUserId();
  //   const communities = ['123', '456'];
  //   const feed = await getFeed(userId, communities);
  //   expect(feed).toBeSortedBy('relevance', 'desc');
  // });
  
  // it('feed includes only posts from requesting user’s communities', async () => {
  //   const userId = fetchDummyUserId();
  //   const communities = ['123', '456'];
  //   const feed = await getFeed(userId, communities);
  //   expect(feed.every((post) => communities.includes(post.communityId))).toBe(true);
  // });
  
  // it('feed ranks posts from same country higher, even if weighted score is lower', async () => {
  //   const userId = fetchDummyUserId();
  //   const communities = ['123', '456'];
  //   const feed = await getFeed(userId, communities);
  //   const country = 'US';
  //   const sameCountryPosts = feed.filter((post) => post.author.country === country);
  //   const otherCountryPosts = feed.filter((post) => post.author.country !== country);
  //   expect(sameCountryPosts).toBeSortedBefore(otherCountryPosts);
  // });
  
  // it('feed ranks posts with highest weighted score first', async () => {
  //   const userId = fetchDummyUserId();
  //   const communities = ['123', '456'];
  //   const feed = await getFeed(userId, communities);
  //   const country = 'US';
  //   const sameCountryPosts = feed.filter((post) => post.author.country === country);
  //   expect(sameCountryPosts).toBeSortedBy((post) => post.weightedScore, 'desc');
  // });
  
  // it('feed returns empty array if no posts are found from requesting user’s communities', async () => {
  //   const userId = fetchDummyUserId();
  //   const communities = ['789'];
  //   const feed = await getFeed(userId, communities);
  //   expect(feed).toEqual([]);
  // });
  });
});

describe('Middlewares', () => {
  describe('Dummy authentication', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction = jest.fn();

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            json: jest.fn()
        };
    });

    it('should allow fetching a dummy userId for authorization', async () => {
      // Arrange
      jest.spyOn(mongoose, 'connect').mockImplementation();
      jest.spyOn(UserModel, 'findOne').mockResolvedValue({ user: 123 })
      
      // Act
      await fetchUserIdMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(nextFunction).toBeCalledTimes(1);
    });
  });
});
