const joi = require("joi");

const forgotPasswordSchema = joi
  .object({
    email: joi.string().email().required().messages({
      "string.email": "Invalid email",
      "string.empty": "Email is required",
      "any.required": "Email is required",
    }),
  })
  .options({ stripUnknown: true });

module.exports = forgotPasswordSchema;
