import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { User } from '../models/user.model';
import { VerificationCode } from '../models/verification-code.model';
import { sendVerificationEmail } from '../services/email.service';

export const googleCallback = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const currentUser = req.user;
        if (!currentUser) {
            return res.redirect(`${process.env.FRONTEND_GOOGLE_CALLBACK_URL}/?status=failure`);
        }
        // redirect to frontend with user data
       return res.redirect("/");
    }
)

export const logoutController = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        req.logout((error) => {
            if (error) {
                return next(error);
            }
        });
        req.session = null;
        return res.status(200).json({ message: "Logout successful" });
    }
)

export const verifyAccount = asyncHandler(async (req: Request, res: Response) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      success: false,
      message: 'Email and verification code are required'
    });
    
  }

  const verificationCode = await VerificationCode.findOne({
    email,
    code,
    expiresAt: { $gt: new Date() }
  });

  if (!verificationCode) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification code'
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  user.isVerified = true;
  await user.save();

  await VerificationCode.deleteOne({ _id: verificationCode._id });

  res.status(200).json({
    success: true,
    message: 'Account verified successfully'
  });
});

export const resendVerificationCode = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
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
}); 

