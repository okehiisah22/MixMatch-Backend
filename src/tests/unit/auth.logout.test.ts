import { Request, Response } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { TokenBlacklist } from '../../models/tokenBlacklist';
import * as authMiddleware from '../../middleware/auth';

// Mock the required dependencies
jest.mock('../../models/tokenBlacklist');
jest.mock('jsonwebtoken');

// Instead of extending Request, create a mock type for tests
type MockRequest = {
  headers: {
    authorization?: string;
    [key: string]: any;
  };
  ip: string;
  user?: {
    userId: string;
    exp?: number;
  };
  cookies: Record<string, any>;
  [key: string]: any;
};

describe('Auth Logout Endpoint', () => {
  let mockRequest: MockRequest;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;
  let authRouter: any;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset the module registry before each test
    jest.resetModules();
    
    // Mock request and response objects
    mockRequest = {
      headers: {
        authorization: 'Bearer test-token'
      },
      ip: '127.0.0.1',
      user: {
        userId: 'test-user-id',
        exp: Math.floor(Date.now() / 1000) + 3600
      },
      cookies: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      clearCookie: jest.fn(),
      setHeader: jest.fn()
    };
    
    nextFunction = jest.fn();
    
    // Import the auth router
    authRouter = require('../../routes/auth').default;
  });

  test('should blacklist token when logging out', async () => {
    // Mock TokenBlacklist.findOne to return null (token not blacklisted)
    (TokenBlacklist.findOne as jest.Mock).mockResolvedValue(null);
    
    // Mock TokenBlacklist.create to return successful creation
    (TokenBlacklist.create as jest.Mock).mockResolvedValue({
      token: 'test-token',
      userId: 'test-user-id',
      expiresAt: new Date(),
      ipAddress: '127.0.0.1',
      userAgent: 'unknown',
      revokedAt: new Date()
    });
    
    // Call the logout route handler directly
    const routeHandler = authRouter.stack.find(
      (layer: any) => layer.route && layer.route.path === '/logout'
    ).route.stack[1].handle;
    
    await routeHandler(mockRequest as any, mockResponse as Response);
    
    // Assertions
    expect(TokenBlacklist.findOne).toHaveBeenCalledWith({ token: 'test-token' });
    expect(TokenBlacklist.create).toHaveBeenCalledWith(expect.objectContaining({
      token: 'test-token',
      userId: 'test-user-id'
    }));
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Successfully logged out' });
  });

  test('should return 400 if no token is provided', async () => {
    // Setup request without token
    mockRequest.headers = {};
    
    // Call the logout route handler directly
    const routeHandler = authRouter.stack.find(
      (layer: any) => layer.route && layer.route.path === '/logout'
    ).route.stack[1].handle;
    
    await routeHandler(mockRequest as any, mockResponse as Response);
    
    // Assertions
    expect(TokenBlacklist.create).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'No token provided' });
  });

  test('should not blacklist token that is already blacklisted', async () => {
    // Mock TokenBlacklist.findOne to return an existing blacklisted token
    (TokenBlacklist.findOne as jest.Mock).mockResolvedValue({
      token: 'test-token',
      userId: 'test-user-id',
      expiresAt: new Date()
    });
    
    // Call the logout route handler directly
    const routeHandler = authRouter.stack.find(
      (layer: any) => layer.route && layer.route.path === '/logout'
    ).route.stack[1].handle;
    
    await routeHandler(mockRequest as any, mockResponse as Response);
    
    // Assertions
    expect(TokenBlacklist.findOne).toHaveBeenCalledWith({ token: 'test-token' });
    expect(TokenBlacklist.create).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Already logged out' });
  });

  test('should handle errors gracefully', async () => {
    // Mock TokenBlacklist.findOne to throw an error
    (TokenBlacklist.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));
    
    // Call the logout route handler directly
    const routeHandler = authRouter.stack.find(
      (layer: any) => layer.route && layer.route.path === '/logout'
    ).route.stack[1].handle;
    
    await routeHandler(mockRequest as any, mockResponse as Response);
    
    // Assertions
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
}); 