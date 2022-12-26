import 'dotenv/config';
import express from 'express';
import cors from 'cors';
// import mongoose from 'mongoose';

import Router from './routes/router';
import corsOptions from './config/cors';
import Middleware from './middleware';

const app: express.Application = express();

// // Connect to MongoDB using Mongoose
// mongoose.connect('mongodb://localhost:27017/my-db');

// const db = mongoose.connection;

// db.on('error', (err) => {
//   // DB connection errors
//   console.error('An error occurred while connecting to the DB', { err });
// });

// Define express.js app
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(Middleware);

app.use(Router);

export default app;
