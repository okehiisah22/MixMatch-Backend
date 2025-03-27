
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import session from 'cookie-session';
import passport from 'passport';
import logger from './config/logger';
import { connectDB } from './config/db';
import { loggingHandler } from './middleware/pinoHttp';
import { routeError } from './middleware/routeError';
import authRoutes from './routes/auth.routes';

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import logger from "./config/logger";
import { connectDB } from "./config/db";
import { loggingHandler } from "./middleware/pinoHttp";
import { routeError } from "./middleware/routeError";
import mixmatchRoutes from "./routes";
import reviewRoutes from "./routes/review.routes"; // Add this import



// Load environment variables before using them
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3100;

app.use(
	cors({
		origin: "*",
		allowedHeaders: "*",
		exposedHeaders: "*",
	})
);

app.use(loggingHandler);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));


app.use(session({
  name: 'session',
  keys: [process.env.SESSION_SECRET as string],
  maxAge: 24 * 60 * 60 * 1000,
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
  sameSite: "lax",
}))
app.use(passport.initialize());
app.use(passport.session());

app.use('/health', (req, res) => {
  res.status(200).json({ greeting: 'Hello World! Mixmatch' });
});

// Auth routes
app.use('/api/auth', authRoutes);

app.use("/health", (req, res) => {
	res.status(200).json({ greeting: "Hello World! Mixmatch" });
});

// Move this line here
app.use("/api/v1/reviews", reviewRoutes);

app.use("/api/v1/", mixmatchRoutes());


// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


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

