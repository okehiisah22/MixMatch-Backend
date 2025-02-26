const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const { sendEmail } = require('../services/email.service');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PublicProfile = require('../models/PublicProfile');
const {
  resetPasswordSchema,
  forgotPasswordSchema,
} = require('../helpers/joivalidators/auth');
const AutomatedReplyController = require('../controllers/automatedReplyController');
const crypto = require('crypto');
const AssistantController = require('./assistantController');
const Pricing = require('../models/Pricing');

const generateReferralCode = () => {
  return crypto.randomBytes(4).toString('hex');
};

const AuthController = {
  register: async (req, res) => {
    try {
      const {
        firstName = '',
        lastName = '',
        email,
        password,
        isAdmin,
        referralCode,
      } = req.body;

      if (!isAdmin) {
        if (!firstName || !lastName || !email || !password) {
          return res
            .status(400)
            .json({ success: false, message: 'All fields are required' });
        }
      } else {
        if (!email || !password) {
          return res
            .status(400)
            .json({ success: false, message: 'All fields are required' });
        }
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: 'Email already in use' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const email_verification = uuid();
      const newReferralCode = generateReferralCode();

      let newUser;
      if (!isAdmin) {
        newUser = await User.create({
          firstName,
          lastName,
          email,
          password: hashedPassword,
          email_verification,
          referralCode: newReferralCode,
        });
      } else {
        newUser = await User.create({
          firstName: '',
          lastName: '',
          email,
          password: hashedPassword,
          email_verification,
          isAdmin: true,
          firstLogin: false,
          referralCode: newReferralCode,
        });
      }

      if (referralCode) {
        const referringUser = await User.findOne({ referralCode });
        if (referringUser) {
          referringUser.referredUsers.push(newUser._id);
          await referringUser.save();
        }
      }

      const verification_link = `${
        process.env.BASE_URL
      }/auth/verify?email_verification=${email_verification}&user=${newUser._id?.toString()}`;

      const context = {
        verification_link,
        user: {
          email: newUser.email,
        },
      };

      await AssistantController.seedDefaultAssistant(
        req,
        res,
        newUser._id.toString()
      );

      const subject = 'Kindly verify your email';
      const isEmailSent = await sendEmail(
        email,
        subject,
        'verifyAccount',
        context
      );
      if (!isEmailSent) {
        return res
          .status(400)
          .json({ success: false, message: 'An error occurred while sending' });
      }

      return res.status(201).json({ success: true, data: newUser });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'An error occurred while creating account',
      });
    }
  },

  resendVerificationEmail: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: 'Email not found' });
      }

      if (user.isVerified) {
        return res
          .status(400)
          .json({ success: false, message: 'Email already verified' });
      }
      const email_verification = uuid();
      const verification_link = `${
        process.env.BASE_URL
      }/auth/verify?email_verification=${email_verification}&user=${user._id?.toString()}`;
      const context = {
        verification_link,
        user: {
          email: user.email,
        },
      };

      const subject = 'Kindly verify your email';
      const isEmailSent = await sendEmail(
        email,
        subject,
        'verifyAccount',
        context
      );

      if (!isEmailSent) {
        return res.status(400).json({
          success: false,
          message: 'An error occurred while sending email',
        });
      }

      user.email_verification = email_verification;
      await user.save();
      return res.status(200).json({ success: true, message: 'Email sent' });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'An error occurred while creating account',
      });
    }
  },

  verifyEmail: async (req, res) => {
    try {
      const { token, user: userId } = req.params;
      const user = await User.findOne({
        _id: userId,
        email_verification: token,
      });

      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid  token' });
      }

      if (user.isVerified) {
        return res
          .status(400)
          .json({ success: false, message: 'Email already verified' });
      }

      user.isVerified = true;

      await user.save();

      const get_started_link = `${process.env.BASE_URL}/auth/login`;
      const context = {
        get_started_link,
        user: {
          firstName: user.firstName,
        },
      };
      const subject = 'Welcome to Mixmatch';
      const isEmailSent = await sendEmail(
        user.email,
        subject,
        'welcomeEmail',
        context
      );

      if (!isEmailSent) {
        return res.status(400).json({
          success: false,
          message: 'An error occurred while sending email',
        });
      }

      return res
        .status(200)
        .json({ success: true, message: 'Email verified successfully' });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'An error occurred while verifying email',
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).lean();

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Email verification check if needed
      // if (!user.isVerified) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "Please verify your email first"
      //   });
      // }

      // Update user login status with a single atomic operation
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        {
          $set: {
            lastLogin: new Date(),
            ...(user.firstLogin ? { firstLogin: false } : {}),
          },
        },
        { new: true }
      ).lean();

      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      const [publicProfile, userPricing] = await Promise.all([
        PublicProfile.findOne({ user: user._id }).lean(),
        Pricing.findOne({ userId: user._id }).lean(),
      ]);

      const responseData = {
        ...updatedUser,
        publicProfile,
      };

      return res.status(200).json({
        success: true,
        data: responseData,
        token,
        isFirstLogin: user.firstLogin,
        subscriptionTier: userPricing?.subscriptionTier || 'rookie',
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'An error occurred while logging in',
      });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      const { error, value } = forgotPasswordSchema.validate(req.body);

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      const user = await User.findOne({ email: value.email });
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: 'Email not found' });
      }

      const resetPasswordToken = uuid();

      const reset_link = `${
        process.env.BASE_URL
      }/auth/resetpassword?token=${resetPasswordToken}&user=${user._id?.toString()}`;

      const subject = 'Reset your password';

      const context = {
        reset_link,
        user: {
          firstName: user.firstName,
        },
      };

      const isEmailSent = await sendEmail(
        email,
        subject,
        'resetPassword',
        context
      );

      if (!isEmailSent) {
        return res
          .status(400)
          .json({ success: false, message: 'An error occurred while sending' });
      }

      user.passwordResetToken = resetPasswordToken;
      user.passwordResetExpires = Date.now() + 600000; // 10 minutes

      await user.save();

      return res.status(200).json({ success: true, message: 'Email sent' });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'An error occurred while creating account',
      });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { token, user: userId } = req.params;

      const { error, value } = resetPasswordSchema.validate(req.body);

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      const user = await User.findOne({
        _id: userId,
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid or expired token' });
      }

      const hashedPassword = await bcrypt.hash(value.password, 10);
      user.password = hashedPassword;
      user.passwordResetToken = null;
      user.passwordResetExpires = null;

      await user.save();

      const subject = 'Password Reset Successful';
      const isEmailSent = await sendEmail(
        user.email,
        subject,
        'passwordResetSuccess',
        {}
      );
      if (!isEmailSent) {
        return res
          .status(400)
          .json({ success: false, message: 'An error occurred while sending' });
      }
      return res
        .status(200)
        .json({ success: true, message: 'Password reset successful' });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'An error occurred while creating account',
      });
    }
  },

  googleLogin: async (req, res) => {
    try {
      const { last_name, first_name, email, email_verified } = req.body;
      let isFirstLogin = false;

      if (!last_name || !first_name || !email) {
        return res
          .status(400)
          .json({ success: false, message: 'Missing fields' });
      }

      let existingUser = await User.findOne({ email });

      if (!existingUser) {
        isFirstLogin = true;
        const newUser = await User.create({
          firstName: first_name,
          lastName: last_name,
          email,
          isVerified: email_verified,
          googleVerified: email_verified,
          firstLogin: false,
        });

        await AutomatedReplyController.seedDefaultAutomatedReplies(
          req,
          res,
          newUser._id.toString()
        );

        const token = jwt.sign(
          {
            id: newUser._id,
            email: newUser.email,
            firstLogin: newUser.firstLogin,
          },
          process.env.JWT_SECRET,
          { expiresIn: '30d' }
        );

        const isEmailSent = await sendEmail(
          email,
          'Welcome to Mixmatch',
          'welcomeEmail',
          {
            get_started_link: `${process.env.BASE_URL}/auth/login`,
            user: {
              firstName: newUser.firstName,
            },
          }
        );

        if (!isEmailSent) {
          return res.status(400).json({
            success: false,
            message: 'An error occurred while sending email',
          });
        }

        return res
          .status(201)
          .json({ success: true, data: newUser, token, isFirstLogin });
      }

      const publicProfile = await PublicProfile.findOne({
        user: existingUser._id,
      });

      existingUser = existingUser.toObject();
      existingUser.publicProfile = publicProfile;

      const token = jwt.sign(
        {
          id: existingUser._id,
          email: existingUser.email,
          firstLogin: existingUser.firstLogin,
        },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res
        .status(200)
        .json({ success: true, data: existingUser, token, isFirstLogin });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message:
          err.message || 'An error occurred while processing the request',
      });
    }
  },
};

module.exports = AuthController;
