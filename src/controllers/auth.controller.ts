import { Request, Response } from 'express';
import { User, UserRole } from '../models/user.model';
import { VerificationCode } from '../models/verification-code.model';
import { sendVerificationEmail } from '../services/email.service';
import { asyncHandler } from '../utils/asyncHandler';
import { UserService } from '../services/user.service';
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
        message: "Email is required",
      });
    }

    const result = await VerificationService.generateAndSendCode(email);

    return res
      .status(
        result.success ? 200 : result.message === "User not found" ? 404 : 400
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
        message: "Missing required fields",
      });
      return;
    }

    // Validate role is one of the allowed values
    if (!Object.values(UserRole).includes(role as UserRole)) {
      res.status(400).json({
        success: false,
        message: `Role must be one of: ${Object.values(UserRole).join(", ")}`,
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "User with this email already exists",
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
    // await VerificationService.generateAndSendCode(email);

    // Remove password from response using object destructuring
    const userObj = newUser.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userResponse } = userObj;

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please check your email for verification code.",
      data: userResponse,
    });
  } catch (error) {
    logger.error("Error in signup controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

export const signin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate request body
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    // Authenticate user
    const user = await UserService.authenticate(email, password);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

  if (user.isVerified) {
    return res.status(400).json({
      success: false,
      message: 'Account is already verified'
    });
  }

  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await VerificationCode.findOneAndUpdate(
    { email },
    { code: verificationCode, expiresAt },
    { upsert: true }
  );

  const emailResult = await sendVerificationEmail(email, verificationCode);
  
  if (!emailResult.success) {
    return res.status(500).json(emailResult);
  }

  return res.status(200).json({
    success: true,
    message: 'Verification code sent successfully'
  });
} catch (error) {
  logger.error('Error in resendVerificationCode controller:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: (error as Error).message,
  });
}
});