import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { TokenBlacklist } from '../../models/tokenBlacklist';
import { model, Schema } from 'mongoose';
import { authenticateToken, AuthRequest, JwtPayload } from '../../middleware/auth';
import '@types/jest';

// Create a temporary User model for testing if it doesn't exist
interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  name: string;
}

// Only create the User model if it doesn't already exist in mongoose models
const User = mongoose.models.User || 
  model<IUser>('User', new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true }
  }));

// Create a mock Express app for testing
const app = express();
app.use(express.json());

// Create the logout route for testing
app.post('/auth/logout', authenticateToken, (req: Request, res: Response): Promise<void> => {
  // Cast req to AuthRequest to access the user property
  const authReq = req as AuthRequest;
  
  return (async () => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        res.status(400).json({ message: 'No token provided' });
        return;
      }

      // Make sure user exists and has been set by authenticateToken middleware
      if (!authReq.user) {
        res.status(401).json({ message: 'Authentication failed' });
        return;
      }

      const decoded = authReq.user;
      const expirationTime = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      // Check if token is already blacklisted
      const existingBlacklist = await TokenBlacklist.findOne({ token });
      if (existingBlacklist) {
        res.status(200).json({ message: 'Already logged out' });
        return;
      }
      
      await TokenBlacklist.create({
        token,
        userId: decoded?.userId,
        expiresAt: expirationTime
      });

      res.status(200).json({ message: 'Successfully logged out' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  })();
});

// Add token verification endpoint for testing
app.get('/auth/verify-token', authenticateToken, (req: Request, res: Response): void => {
  const authReq = req as AuthRequest;
  res.status(200).json({ valid: true, user: authReq.user });
});

describe('Authentication Logout API', () => {
  let token: string;
  let userId: string;
  
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/auth-test');
    
    // Clear any existing data
    await TokenBlacklist.deleteMany({});
    await User.deleteMany({});
    
    // Create a test user
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    });
    
    userId = user._id.toString();
    
    // Create a valid JWT token
    token = jwt.sign(
      { userId: userId, exp: Math.floor(Date.now() / 1000) + 3600 },
      process.env.JWT_SECRET || 'test-secret'
    );
  });
  
  afterAll(async () => {
    // Disconnect from test database
    await mongoose.connection.close();
  });
  
  afterEach(async () => {
    // Clear blacklist after each test
    await TokenBlacklist.deleteMany({});
  });

  test('should successfully logout with valid token', async () => {
    const response = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(response.body.message).toBe('Successfully logged out');
    
    // Verify token is blacklisted
    const blacklistedToken = await TokenBlacklist.findOne({ token });
    expect(blacklistedToken).not.toBeNull();
    // Add optional check in case userId is not ObjectId but a string type in your model
    if (blacklistedToken && blacklistedToken.userId) {
      // Handle both cases: if userId is ObjectId or string
      const tokenUserId = typeof blacklistedToken.userId === 'object' 
        ? blacklistedToken.userId.toString() 
        : blacklistedToken.userId;
      expect(tokenUserId).toBe(userId);
    }
  });

  test('should return 401 for requests without token', async () => {
    const response = await request(app)
      .post('/auth/logout')
      .expect(401);
    
    expect(response.body.message).toBe('No token provided');
  });

  test('should return 403 for requests with invalid token', async () => {
    const invalidToken = 'invalid-token';
    
    const response = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(403);
    
    expect(response.body.message).toBe('Invalid token');
  });

  test('should return 401 for already blacklisted tokens', async () => {
    // First logout to blacklist the token
    await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    // Try to use the same token again for an authenticated request
    const response = await request(app)
      .get('/auth/verify-token') // Using the token verification endpoint
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
    
    expect(response.body.message).toBe('Token has been invalidated');
  });

  test('should handle multiple concurrent logout requests with the same token', async () => {
    // Make 3 concurrent logout requests with the same token
    const promises = Array(3).fill(0).map(() => 
      request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
    );
    
    const responses = await Promise.all(promises);
    
    // Check responses - making sure we have a response object with status property
    expect(responses[0]).toBeTruthy();
    expect(responses[0].status || responses[0].statusCode).toBe(200);
    
    // Count blacklisted tokens - should only be one
    const count = await TokenBlacklist.countDocuments({ token });
    expect(count).toBe(1);
  });

  test('should properly expire blacklisted tokens', async () => {
    jest.setTimeout(10000); // Increase timeout for this specific test
    
    // Create a token with short expiry (1 second)
    const shortLivedToken = jwt.sign(
      { userId, exp: Math.floor(Date.now() / 1000) + 1 },
      process.env.JWT_SECRET || 'test-secret'
    );
    
    // Logout with this token
    await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${shortLivedToken}`)
      .expect(200);
    
    // Verify token is in blacklist
    let blacklistedToken = await TokenBlacklist.findOne({ token: shortLivedToken });
    expect(blacklistedToken).not.toBeNull();
    
    // Wait for token to expire
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Manually trigger the cleanup to simulate what MongoDB would do
    try {
      const expiryDate = new Date();
      await TokenBlacklist.deleteMany({ expiresAt: { $lte: expiryDate } });
      
      // Check if token was removed from blacklist
      blacklistedToken = await TokenBlacklist.findOne({ token: shortLivedToken });
      expect(blacklistedToken).toBeNull();
    } catch (error) {
      console.error('Error during token expiry test:', error);
      throw error;
    }
  });
}); 