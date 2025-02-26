const joi = require("joi");

const updateUserProfileSchema = joi
  .object({
    firstName: joi.string().allow(""),
    lastName: joi.string().allow(""),
    phoneNumber: joi.string().min(10).allow(""),
    profilePicture: joi.string().allow(""),
    coverPicture: joi.string().allow(""),
    twoFactorAuth: joi.boolean(),
    authenticationApp: joi.boolean(),
    allowAllNotifications: joi.boolean(),
    allowBookingNotifications: joi.boolean(),
    allowNewConversationNotifications: joi.boolean(),
    allowEventReminderNotifications: joi.boolean(),
    allowOfflineMessagesNotifications: joi.boolean(),
    automatedMessagesEnabled: joi.boolean(),
    country: joi.string().allow(""),
    city: joi.string().allow(""),
    address: joi.string().allow(""),
    postalCode: joi.string().allow(""),
    facebook: joi.string().uri().allow(""),
    twitter: joi.string().uri().allow(""),
    linkedin: joi.string().uri().allow(""),
    instagram: joi.string().uri().allow(""),
    youtube: joi.string().uri().allow(""),
    spotify: joi.string().uri().allow(""),
    instagram: joi.string().uri().allow(""),
  })
  .options({ stripUnknown: true });

module.exports = updateUserProfileSchema;
