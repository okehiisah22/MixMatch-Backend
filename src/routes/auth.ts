import { Router, Response } from 'express';
import { authenticateToken, AuthRequest, JwtPayload } from '../middleware/auth';
import { TokenBlacklist } from '../models/tokenBlacklist';

const router = Router();

// ... existing code ...

router.post('/logout', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get the token from the authorization header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      res.status(400).json({ message: 'No token provided' });
      return;
    }

    // Extract token expiration from the JWT payload
    const decoded = req.user as JwtPayload;
    const expirationTime = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // Check if token is already blacklisted to prevent duplicate entries
    const existingBlacklist = await TokenBlacklist.findOne({ token });
    if (existingBlacklist) {
      res.status(200).json({ message: 'Already logged out' });
      return;
    }
    
    // Add the token to the blacklist with additional security metadata
    await TokenBlacklist.create({
      token,
      userId: decoded?.userId,
      expiresAt: expirationTime,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || 'unknown',
      revokedAt: new Date()
    });

    // Invalidate all refresh tokens if using refresh token rotation
    if (decoded?.userId) {
      // Optional: If using refresh tokens, invalidate all refresh tokens for this user
      // await RefreshToken.updateMany({ userId: decoded.userId }, { $set: { isRevoked: true } });
    }

    // Clear any auth-related cookies
    res.clearCookie('refreshToken', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    // Add security headers to prevent caching of the response
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    // Log the logout for audit trail
    console.log(`User ${decoded?.userId} logged out successfully at ${new Date().toISOString()}`);
    
    res.status(200).json({ message: 'Successfully logged out' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add a route to check token validity - useful for client-side validation
router.get('/verify-token', authenticateToken, (req: AuthRequest, res: Response): void => {
  res.status(200).json({ valid: true, user: req.user });
});

export default router; 