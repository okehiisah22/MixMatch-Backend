import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import logger from './config/logger';
import { connectDB } from './config/db';
import { loggingHandler } from './middleware/pinoHttp';
import { routeError } from './middleware/routeError';
import mixmatchRoutes from './routes';
import { callbackSpotify, loginSpotify } from './routes/0auth/sportify';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3100;

app.use(
  cors({
    origin: '*',
    allowedHeaders: '*',
    exposedHeaders: '*',
  })
);

app.use(loggingHandler);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

app.use('/health', (req, res) => {
  res.status(200).json({ greeting: 'Hello World! Mixmatch' });
});

app.use('/health', (req, res) => {
  res.status(200).json({ greeting: 'Hello World! Mixmatch' });
});

app.get('/api/auth/spotify/login', loginSpotify);
app.get('/api/auth/spotify/callback', callbackSpotify);

app.use('/api/v1/', mixmatchRoutes());

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  }
);

app.use(routeError);

app.listen(PORT, () => {
  logger.info(
    `<---------------------------------------------------------------->`
  );
  logger.info(`Server is running on port ${PORT}`);
  connectDB();

  logger.info(
    `<---------------------------------------------------------------->`
  );
});
