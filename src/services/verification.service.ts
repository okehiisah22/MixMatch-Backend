import { VerificationCode } from '../models/verification-code.model';
import { sendVerificationEmail } from '../services/email.service';
import logger from '../config/logger';
import { User } from '../models/user.model';

interface VerificationResult {
  success: boolean;
  message: string;
  data?: any;
}

export class VerificationService {
  /**
   * Generates and sends a verification code to a user
   * @param email User's email address
   * @returns Result object indicating success or failure
   */
  static async generateAndSendCode(email: string): Promise<VerificationResult> {
    try {
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      // Check if already verified
      if (user.isVerified) {
        return {
          success: false,
          message: 'Account is already verified',
        };
      }

      // Generate verification code
      const verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Save or update verification code
      await VerificationCode.findOneAndUpdate(
        { email },
        { code: verificationCode, expiresAt },
        { upsert: true }
      );

      // Send email
      const emailResult = await sendVerificationEmail(email, verificationCode);

      if (!emailResult.success) {
        return {
          success: false,
          message: 'Failed to send verification email',
        };
      }

      return {
        success: true,
        message: 'Verification code sent successfully',
      };
    } catch (error) {
      logger.error('Error in generateAndSendCode:', error);
      return {
        success: false,
        message: 'Failed to generate verification code',
      };
    }
  }

  /**
   * Verifies a user's account using the provided code
   * @param email User's email address
   * @param code Verification code
   * @returns Result object indicating success or failure
   */
  static async verifyCode(
    email: string,
    code: string
  ): Promise<VerificationResult> {
    try {
      // Input validation
      if (!email || !code) {
        return {
          success: false,
          message: 'Email and verification code are required',
        };
      }

      // Find valid verification code
      const verificationCode = await VerificationCode.findOne({
        email,
        code,
        expiresAt: { $gt: new Date() },
      });

      if (!verificationCode) {
        return {
          success: false,
          message: 'Invalid or expired verification code',
        };
      }

      // Find and update user
      const user = await User.findOne({ email });
      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      user.isVerified = true;
      await user.save();

      // Clean up verification code
      await VerificationCode.deleteOne({ _id: verificationCode._id });

      return {
        success: true,
        message: 'Account verified successfully',
      };
    } catch (error) {
      logger.error('Error in verifyCode:', error);
      return {
        success: false,
        message: 'Failed to verify account',
      };
    }
  }
}
