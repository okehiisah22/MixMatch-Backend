import { VerificationCode } from '../models/verification-code.model';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.service';
import logger from '../config/logger';
import { User } from '../models/user.model';
import crypto from 'crypto';

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

  /**
   * Initiates the password reset process for a user
   * @param email User's email address
   * @returns Result object indicating success or failure
   */
  static async initiatePasswordReset(email: string): Promise<VerificationResult> {
    try {
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      // Generate verification code
      const resetCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Save reset token to user
      const resetToken = crypto.randomBytes(20).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = expiresAt;
      await user.save();

      // Save the code separately for verification
      await VerificationCode.findOneAndUpdate(
        { email },
        { 
          code: resetCode, 
          expiresAt 
        },
        { upsert: true }
      );

      // Send email with the code
      const emailResult = await sendPasswordResetEmail(email, resetCode);

      if (!emailResult.success) {
        return {
          success: false,
          message: 'Failed to send password reset email',
        };
      }

      return {
        success: true,
        message: 'Password reset instructions sent to your email',
      };
    } catch (error) {
      logger.error('Error in initiatePasswordReset:', error);
      return {
        success: false,
        message: 'Failed to process password reset request',
      };
    }
  }

  /**
   * Resets a user's password using the provided code
   * @param email User's email address
   * @param code Verification code
   * @param newPassword New password to set
   * @returns Result object indicating success or failure
   */
  static async resetPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<VerificationResult> {
    try {
      // Input validation
      if (!email || !code || !newPassword) {
        return {
          success: false,
          message: 'Email, verification code, and new password are required',
        };
      }

      // Validate password strength
      if (newPassword.length < 6) {
        return {
          success: false,
          message: 'Password must be at least 6 characters long',
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
      const user = await User.findOne({ 
        email,
        resetPasswordExpires: { $gt: new Date() }
      });
      
      if (!user) {
        return {
          success: false,
          message: 'Password reset request is invalid or has expired',
        };
      }

      // Set new password and clear reset token
      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      // Clean up verification code
      await VerificationCode.deleteOne({ _id: verificationCode._id });

      return {
        success: true,
        message: 'Password has been reset successfully',
      };
    } catch (error) {
      logger.error('Error in resetPassword:', error);
      return {
        success: false,
        message: 'Failed to reset password',
      };
    }
  }
}
