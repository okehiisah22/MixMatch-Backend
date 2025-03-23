import { Router } from 'express';
import { verifyAccount, resendVerificationCode } from '../controllers/auth.controller';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

const verificationRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5
});

router.post('/verify-account', verificationRateLimiter, verifyAccount);

router.post('/resend-verification', resendVerificationCode);

export default router; 
