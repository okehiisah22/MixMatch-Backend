import express, { Router } from 'express';
import {
  verifyAccount,
  resendVerificationCode,
  signup,
} from '../controllers/auth.controller';

import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

const verificationRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
});

const authRouter = (router: express.Router) => {
  router.post('/auth/verify-account', verificationRateLimiter, verifyAccount);
  router.post('/auth/resend-verification', resendVerificationCode);
  router.post('/auth/signup', signup);
};

export default authRouter;
