const joi = require("joi");

const resetPasswordSchema = joi
  .object({
    password: joi.string().min(6).required().messages({
      "string.min": "Password should have a minimum length of 6",
      "string.empty": "Password is required",
      "any.required": "Password is required",
    }),
    confirmPassword: joi
      .string()
      .min(6)
      .required("Confirm Password is required")
      .valid(joi.ref("password"))
      .messages({
        "string.min": "Confirm Password should have a minimum length of 6",
        "string.empty": "Confirm Password is required",
        "any.required": "Confirm Password is required",
        "any.only": "Passwords do not match",
      }),
  })
  .options({ stripUnknown: true });

module.exports = resetPasswordSchema;
