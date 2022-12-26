// import express from 'express';
// import mongodb from 'mongodb';

// // Dummy middleware function for fetching a user ID
// const fetchUserIdMiddleware = async (req, res, next) => {
//   try {
//     // Connect to the MongoDB database
//     const client = await mongodb.MongoClient.connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true
//     });
//     const db = client.db();

//     // Find the user in the database using the provided user ID
//     const userId = req.headers.userid;
//     const user = await db.collection('users').findOne({ _id: userId });

//     // If the user is not found, return an error
//     if (!user) {
//       res.status(401).json({ message: 'Invalid user ID' });
//       return;
//     }

//     // If the user is found, attach the user object to the request object
//     req.user = user;
//     next();
//   } catch (error) {
//     res.status(500).json({ message: 'Error connecting to the database' });
//   }
// };

// module.exports = fetchUserIdMiddleware;
