import express, { Router } from 'express';
import {
  verifyAccount,
  resendVerificationCode,
  signup,
  signin
} from '../controllers/auth.controller';

import { rateLimiter } from '../middleware/rateLimiter';
import { rbac } from '../middleware/rbac';

const router = Router();

const verificationRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
});

const authRouter = (router: express.Router) => {
  router.post('/auth/verify-account', verificationRateLimiter, verifyAccount);
  router.post('/auth/resend-verification', resendVerificationCode);
  router.post('/auth/signup', signup);
  router.post('/auth/signin', signin);
  
  // Example of an authenticated route with role restriction (if needed in future)
  // router.get('/auth/profile', 
  //   authenticateToken, 
  //   createRoleMiddleware.forRoles([
  //     UserRole.CLIENT, 
  //     UserRole.DJ, 
  //     UserRole.EVENT_PLANNER
  //   ]), 
  //   getUserProfile
  // );
};

export default authRouter;
