// validations/userValidation.js
const Joi = require('joi');

const userValidationSchema = Joi.object({
  firstName: Joi.string().min(2).max(30).required().messages({
    'string.empty': 'First name is required',
    'string.min': 'First name must be at least 2 characters',
    'string.max': 'First name must be less than 30 characters',
  }),

  lastName: Joi.string().min(2).max(30).required().messages({
    'string.empty': 'Last name is required',
    'string.min': 'Last name must be at least 2 characters',
    'string.max': 'Last name must be less than 30 characters',
  }),

  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please enter a valid email address',
  }),

  password: Joi.string()
    .min(8)
    .max(16)
    .pattern(new RegExp('^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
      'string.max': 'Password must be less than 16 characters',
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one number, and one special character',
    }),

  confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Confirm Password is required',
  }),

  phone: Joi.string()
    .pattern(/^\+?[0-9]+$/)
    .min(10)
    .max(15)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Phone number must contain only digits',
      'string.min': 'Phone number must be at least 10 digits',
      'string.max': 'Phone number must be less than 15 digits',
    }),

  role: Joi.string().valid('user', 'admin').optional().messages({
    'any.only': 'Role must be either user or admin',
  }),
});

module.exports = userValidationSchema;
