import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import logger from './config/logger';
import { loggingHandler } from './middleware/pinoHttp';
import { routeError } from './middleware/routeError';

dotenv.config();
const app = express();

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

app.use(routeError);

app.listen(process.env.PORT, () => {
  logger.info(
    `<---------------------------------------------------------------->`
  );
  logger.info(`Server is running on port ${process.env.PORT}`);
  logger.info(
    `<---------------------------------------------------------------->`
  );
});
