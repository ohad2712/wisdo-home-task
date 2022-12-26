import request from 'supertest';

import app from '../../src/app';

// Arrange

describe('GET /systemcheck', () => {
  it('GET /systemcheck should respond with success message', async () => {
    // Act
    const response = await request(app).get('/');

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Server is running :)',
    });
  });
});

// // dummy autherntication
// test('dummy middleware/function allows fetching a dummy userId for authorization', () => {
//   const userId = fetchDummyUserId();
//   expect(userId).toBeDefined();
// });

// // Upload new posts
// test('user can upload a post assigned to one of their communities', async () => {
//   const userId = fetchDummyUserId();
//   const communityId = '123';
//   const post = {
//     title: 'Test post',
//     body: 'This is a test post',
//   };
//   const res = await uploadPost(userId, communityId, post);
//   expect(res.status).toEqual(200);
// });

// test('user cannot upload a post to a community they are not a member of', async () => {
//   const userId = fetchDummyUserId();
//   const communityId = '456';
//   const post = {
//     title: 'Test post',
//     body: 'This is a test post',
//   };
//   try {
//     await uploadPost(userId, communityId, post);
//   } catch (err) {
//     expect(err.status).toEqual(403);
//   }
// });

// test('system generates summary if it is not provided', async () => {
//   const userId = fetchDummyUserId();
//   const communityId = '123';
//   const post = {
//     title: 'Test post',
//     body: 'This is a test post with more than 100 words. The system should generate a summary by selecting the first 100 words of the body.',
//   };
//   const res = await uploadPost(userId, communityId, post);
//   expect(res.summary).toEqual('This is a test post with more than 100 words. The system should generate a summary by selecting the first 100 words of the body.');
// });

// // Content watching detected alert
// test('system sends email alert for watchlist words in post', async () => {
//   const userId = fetchDummyUserId();
//   const communityId = '123';
//   const post = {
//     title: 'Test post',
//     body: 'This post contains a watchlist word',
//   };
//   const spy = jest.spyOn(console, 'log');
//   await uploadPost(userId, communityId, post);
//   expect(spy).toHaveBeenCalledWith('sendEmail called', {
//     to: ['moderators', 'super moderators'],
//     subject: 'Content watchlist detected',
//     body: 'This post contains a watchlist word. Click the link to view the post: <link to API for fetching the uploaded post>',
//   });
// });

// // Feed relevance functionality
// test('feed is ranked by relevance score in descending order', async () => {
//   const userId = fetchDummyUserId();
//   const communities = ['123', '456'];
//   const feed = await getFeed(userId, communities);
//   expect(feed).toBeSortedBy('relevance', 'desc');
// });

// test('feed includes only posts from requesting user’s communities', async () => {
//   const userId = fetchDummyUserId();
//   const communities = ['123', '456'];
//   const feed = await getFeed(userId, communities);
//   expect(feed.every((post) => communities.includes(post.communityId))).toBe(true);
// });

// test('feed ranks posts from same country higher, even if weighted score is lower', async () => {
//   const userId = fetchDummyUserId();
//   const communities = ['123', '456'];
//   const feed = await getFeed(userId, communities);
//   const country = 'US';
//   const sameCountryPosts = feed.filter((post) => post.author.country === country);
//   const otherCountryPosts = feed.filter((post) => post.author.country !== country);
//   expect(sameCountryPosts).toBeSortedBefore(otherCountryPosts);
// });

// test('feed ranks posts with highest weighted score first', async () => {
//   const userId = fetchDummyUserId();
//   const communities = ['123', '456'];
//   const feed = await getFeed(userId, communities);
//   const country = 'US';
//   const sameCountryPosts = feed.filter((post) => post.author.country === country);
//   expect(sameCountryPosts).toBeSortedBy((post) => post.weightedScore, 'desc');
// });

// test('feed returns empty array if no posts are found from requesting user’s communities', async () => {
//   const userId = fetchDummyUserId();
//   const communities = ['789'];
//   const feed = await getFeed(userId, communities);
//   expect(feed).toEqual([]);
// });
