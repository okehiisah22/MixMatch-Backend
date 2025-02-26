const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const { sendEmail } = require('../services/email.service');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  changePasswordSchema,
  updateUserProfileSchema,
} = require('../helpers/joivalidators/user');

const UserController = {
  addGenres: async (req, res) => {
    const userId = req.user._id;
    const selectedGenres = req.body.genre;
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.genres = selectedGenres;

      if (user.firstLogin === true) {
        user.firstLogin = false;
      }

      await user.save();
      return res
        .status(200)
        .json({ message: 'Genres added successfully', user });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  getUser: async (req, res) => {
    try {
      const user = req.user;
      return res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: user,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err?.message || 'An error occurred while retrieving user',
      });
    }
  },

  updateUserProfile: async (req, res) => {
    try {
      const userId = req.user._id;
      const { error, value } = updateUserProfileSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      const user = await User.findByIdAndUpdate(userId, value, { new: true });

      return res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err?.message || 'An error occurred while updating user',
      });
    }
  },

  changePassword: async (req, res) => {
    try {
      const userId = req.user._id;
      const { error, value } = changePasswordSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      const user = await User.findById(userId);

      const isMatch = await bcrypt.compare(
        value.currentPassword,
        user.password
      );

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      const hashedPassword = await bcrypt.hash(value.newPassword, 10);

      user.password = hashedPassword;

      await user.save();

      const subject = 'Password Change';
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

      return res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err?.message || 'An error occurred while changing password',
      });
    }
  },

  enableAutomatedInvoice: async (req, res) => {
    try {
      const { userId } = req.user._id;
      const { enabled, timeToSend, dueDate, trigger, paymentOptions } =
        req.body;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.automatedInvoice.enabled = enabled;
      if (enabled) {
        user.automatedInvoice.timeToSend = timeToSend;
        user.automatedInvoice.dueDate = dueDate;
        user.automatedInvoice.eventTypeTrigger = trigger;
        user.automatedInvoice.paymentOptions = paymentOptions;
      }

      await user.save();

      res.json({ user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  getReferralCode: async (req, res) => {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ referralCode: user.referralCode });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

module.exports = UserController;
