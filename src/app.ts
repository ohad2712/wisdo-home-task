import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import Router from './routes/router';
import corsOptions from './config/cors';
import Middleware from './middleware';
import { errorHandler } from './errorUtils';
import { fetchUserIdMiddleware } from './middleware/authentication';

const app: express.Application = express();

// Define express.js app
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(Middleware);
app.use(errorHandler);
app.use(fetchUserIdMiddleware);

app.use(Router);

export default app;
