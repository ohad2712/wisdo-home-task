import request from 'supertest';
import mongoose, { Types } from 'mongoose';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import app from '../../src/app';
import { fetchUserIdMiddleware } from '../../src/middleware/authentication';
import { CommunityModel, PostModel, UserModel } from '../../src/models';
import { disconnectFromDb } from '../../src/dbUtils';
import * as userService from '../../src/services/users';
import * as userController from '../../src/controllers/users';
import { generateCommunities, generatePosts, generateUsers } from '../utils/app';

const mongodbUri = 'mongodb://localhost:27017/test';

describe('App routes', () => {
  beforeAll(async ()=> {
    // Disconnect any existing DB instances before starting
    await disconnectFromDb();
    await mongoose.connect(mongodbUri);
  });

  beforeEach(async () => {
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
      expect(response.status).toBe(StatusCodes.OK);
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
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.title).toBe('Test title');
      expect(response.body.summary).toBe('Test summary');
      expect(response.body.body).toBe('Test body');
    });
  
    it('should return an empty object if the post does not exist', async () => {
      // Arrange
      // Generate a non existing post ObjectId
      const notExistingPostId = new Types.ObjectId();
      
      // Act
      const response = await request(app)
        .get(`/app/posts/${notExistingPostId}`)
        .set({
          mongodburi: mongodbUri,
          userid: user._id,
        });

      // Assert
      expect(response.status).toBe(StatusCodes.OK);
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
      expect(response.status).toBe(StatusCodes.OK);
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
      expect(response.status).toBe(StatusCodes.FORBIDDEN);
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
      expect(response.status).toBe(StatusCodes.OK);
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
  });

  describe('GET /users/:id/feed', () => {
    it('should only include posts that belong to one of the requesting user\'s communities', async () => {
      // Arrange
      const communitiesData = [
        { _id: new Types.ObjectId(1) },
        { _id: new Types.ObjectId(2) },
        { _id: new Types.ObjectId(3) },
      ];

      const usersData = [
        { _id: new Types.ObjectId(1), communities: [1, 3].map((id) => communitiesData[id - 1]._id) },
      ];

      const postsData = [
        { _id: new Types.ObjectId(1), community: communitiesData[0]._id, likes: 10, body: 'x'.repeat(20) },
        { _id: new Types.ObjectId(2), community: communitiesData[1]._id, likes: 15, body: 'x'.repeat(25) },
        { _id: new Types.ObjectId(3), community: communitiesData[2]._id, likes: 5, body: 'x'.repeat(10) },
      ];

      await generateCommunities(communitiesData);
      await generateUsers(usersData);
      await generatePosts(postsData);
      
      // Ignore the sorting mechanism. We just need to check the communities
      jest.spyOn(userController, 'sortPosts').mockImplementation((arr) => arr);

      // Act
      const response = await request(app)
        .get(`/app/users/${usersData[0]._id}/feed`)
        .set({
          mongodburi: mongodbUri,
          userid: usersData[0]._id,
        });      

      // Assert
      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            _id: postsData[0]._id.toString(),
            community: communitiesData[0]._id.toString(),
            likes: postsData[0].likes,
            body: postsData[0].body,
          }),
          expect.objectContaining({
            _id: postsData[2]._id.toString(),
            community: communitiesData[2]._id.toString(),
            likes: postsData[2].likes,
            body: postsData[2].body,
          })
        ])
      );
    });

    it('should rank posts where the post author is from the same country first', async () => {
      // Arrange
      const communitiesData = [
        { _id: new Types.ObjectId(1) },
      ];

      const usersData = [
        { 
          _id: new Types.ObjectId(1),
          communities: [communitiesData[0]._id],
          country: 'Israel'
        },
        { 
          _id: new Types.ObjectId(2),
          communities: [communitiesData[0]._id],
          country: 'USA'
        },
        {
          _id: new Types.ObjectId(3),
          communities: [communitiesData[0]._id],
          country: 'Israel'
        },

        // The test user
        { 
          _id: new Types.ObjectId(4),
          communities: [communitiesData[0]._id],
          country: 'Israel'
        },
      ];

      const postsData = [
        { 
          _id: new Types.ObjectId(1),
          community: communitiesData[0]._id,
          likes: 10,
          body: 'x'.repeat(20),
          author: usersData[0]._id,
        },
        { 
          _id: new Types.ObjectId(2),
          community: communitiesData[0]._id,
          likes: 15,
          body: 'x'.repeat(25),
          author: usersData[1]._id,
        },
        { 
          _id: new Types.ObjectId(3),
          community: communitiesData[0]._id,
          likes: 5,
          body: 'x'.repeat(10),
          author: usersData[2]._id,
        },
      ];

      await generateCommunities(communitiesData);
      await generateUsers(usersData);
      await generatePosts(postsData);
      
      const testUser = usersData[3];

      // Act
      const response = await request(app)
        .get(`/app/users/${testUser._id}/feed`)
        .set({
          mongodburi: mongodbUri,
          userid: testUser._id,
        });      

      // Assert
      expect(response.body).toHaveLength(3);
      expect(response.body).toEqual([
          expect.objectContaining({
            likes: postsData[0].likes,
            body: postsData[0].body,
            author: expect.objectContaining({
              country: usersData[0].country, // Israel
            }),
          }),
          expect.objectContaining({
            likes: postsData[2].likes,
            body: postsData[2].body,
            author: expect.objectContaining({
              country: usersData[2].country, // Israel
            }),
          }),
          expect.objectContaining({
            likes: postsData[1].likes,
            body: postsData[1].body,
            author: expect.objectContaining({
              country: usersData[1].country, // USA
            }),
          }),
        ]);
    });

    it('should rank posts based on the weighted score', async () => {
      // Arrange
      const communitiesData = [
        { _id: new Types.ObjectId(1) },
      ];

      const usersData = [
        { 
          _id: new Types.ObjectId(1),
          communities: [communitiesData[0]._id],
          country: 'Israel'
        },
      ];

      const postsData = [
        { 
          _id: new Types.ObjectId(1),
          community: communitiesData[0]._id,
          likes: 10,
          body: 'x'.repeat(20),
          author: usersData[0]._id,
        },
        { 
          _id: new Types.ObjectId(2),
          community: communitiesData[0]._id,
          likes: 15,
          body: 'x'.repeat(25),
          author: usersData[0]._id,
        },
        { 
          _id: new Types.ObjectId(3),
          community: communitiesData[0]._id,
          likes: 5,
          body: 'x'.repeat(10),
          author: usersData[0]._id,
        },
      ];

      await generateCommunities(communitiesData);
      await generateUsers(usersData);
      await generatePosts(postsData);
      
      // Act
      const response = await request(app)
        .get(`/app/users/${usersData[0]._id}/feed`)
        .set({
          mongodburi: mongodbUri,
          userid: usersData[0]._id,
        });      

      // Assert
      expect(response.body).toHaveLength(3);
      expect(response.body).toEqual([
          expect.objectContaining({
            likes: postsData[1].likes,
            body: postsData[1].body,
          }),
          expect.objectContaining({
            likes: postsData[0].likes,
            body: postsData[0].body,
          }),
          expect.objectContaining({
            likes: postsData[2].likes,
            body: postsData[2].body,
          }),
        ]);
    });

    it('should return an empty array if no posts are found from one of the user\'s communities', async () => {
      // Arrange
      const communitiesData = [
        { _id: new Types.ObjectId(1) },
        { _id: new Types.ObjectId(2) },
        { _id: new Types.ObjectId(3) },
        { _id: new Types.ObjectId(4) },
      ];

      const usersData = [
        { 
          _id: new Types.ObjectId(1),
          communities: [communitiesData[0]._id],
          country: 'Israel'
        },
        { 
          _id: new Types.ObjectId(2),
          communities: [communitiesData[1]._id],
          country: 'Israel'
        },
        {
          _id: new Types.ObjectId(3),
          communities: [communitiesData[2]._id],
          country: 'Israel'
        },

        // The test user
        { 
          _id: new Types.ObjectId(4),
          communities: [communitiesData[3]._id],
          country: 'Israel'
        },
      ];

      const postsData = [
        { 
          _id: new Types.ObjectId(1),
          community: communitiesData[0]._id,
          likes: 10,
          body: 'x'.repeat(20),
          author: usersData[0]._id,
        },
        { 
          _id: new Types.ObjectId(2),
          community: communitiesData[0]._id,
          likes: 15,
          body: 'x'.repeat(25),
          author: usersData[1]._id,
        },
        { 
          _id: new Types.ObjectId(3),
          community: communitiesData[0]._id,
          likes: 5,
          body: 'x'.repeat(10),
          author: usersData[2]._id,
        },
      ];

      await generateCommunities(communitiesData);
      await generateUsers(usersData);
      await generatePosts(postsData);
      
      const testUser = usersData[3];

      // Act
      const response = await request(app)
        .get(`/app/users/${testUser._id}/feed`)
        .set({
          mongodburi: mongodbUri,
          userid: testUser._id,
        });      

      // Assert
      expect(response.body).toHaveLength(0);
    });
  }); 
});

describe('App middlewares', () => {
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

