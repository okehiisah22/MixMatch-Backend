import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { User, UserRole } from '../models/user.model';
import { VerificationService } from '../services/verification.service';
import logger from '../config/logger';

export const verifyAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, code } = req.body;

    const result = await VerificationService.verifyCode(email, code);

    return res.status(result.success ? 200 : 400).json(result);
  }
);

export const resendVerificationCode = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const result = await VerificationService.generateAndSendCode(email);

    return res
      .status(
        result.success ? 200 : result.message === 'User not found' ? 404 : 400
      )
      .json(result);
  }
);

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      profilePicture,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
      return;
    }

    // Validate role is one of the allowed values
    if (!Object.values(UserRole).includes(role as UserRole)) {
      res.status(400).json({
        success: false,
        message: `Role must be one of: ${Object.values(UserRole).join(', ')}`,
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
      return;
    }

    // Create new user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      profilePicture,
      isVerified: false,
    });

    // Generate and send verification code
    await VerificationService.generateAndSendCode(email);

    // Remove password from response using object destructuring
    const userObj = newUser.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userResponse } = userObj;

    res.status(201).json({
      success: true,
      message:
        'User registered successfully. Please check your email for verification code.',
      data: userResponse,
    });
  } catch (error) {
    logger.error('Error in signup controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: (error as Error).message,
    });
  }
};

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    // Validate email input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Regular expression for basic email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email',
      });
    }

    // Initiate password reset
    const result = await VerificationService.initiatePasswordReset(email);

    // Always return a 200 status for security reasons, even if user not found
    // This prevents user enumeration attacks
    return res.status(200).json({
      success: true,
      message: 
        result.success 
          ? 'Password reset instructions sent to your email' 
          : 'If an account exists with this email, password reset instructions will be sent',
    });
  }
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, code, newPassword } = req.body;

    // Validate required fields
    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, verification code, and new password are required',
      });
    }

    // Reset password
    const result = await VerificationService.resetPassword(email, code, newPassword);

    return res.status(result.success ? 200 : 400).json(result);
  }
);
