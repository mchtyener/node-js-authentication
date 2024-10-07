const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const userValidationSchema = require('../validations/userValidation');
const router = express.Router();
const Otp = require('../models/otp');
const tokenBlacklist = require('../models/TokenBlacklist');
const {
  generateOTP,
  sendOTP,
  verifyOtpHelper,
} = require('../services/otpService');
const {
  generateEmailVerificationToken,
  sendVerificationEmail,
  verifyEmailVerificationToken,
} = require('../services/verificationEmailService');

router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      return res
        .status(400)
        .json({ message: 'Authorization header is missing' });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(400).json({ message: 'Token is missing' });
    }

    await tokenBlacklist.create({ token });
    res.status(200).json({ message: 'Successfully logged out', success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', success: false });
  }
});

router.post('/register', async (req, res) => {
  const { error } = userValidationSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ message: error.details[0].message, success: false });
  }

  const { firstName, lastName, email, password, confirmPassword, phone } =
    req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = generateEmailVerificationToken(email);

    const isEmailSent = await sendVerificationEmail(email, verificationToken);

    if (isEmailSent) {
      const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        role: 'user',
      });

      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Registration successful, please verify your email.',
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.',
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is not verified' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const otp = generateOTP();

    await Otp.deleteOne({ email });

    const newOtp = new Otp({
      email,
      otp,
      expiresAt: Date.now() + 1 * 60 * 1000,
    });

    await newOtp.save();

    await sendOTP(email, otp);

    res.status(200).json({ message: 'OTP sent to your email', success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: 'Bu e-posta ile kayıtlı bir kullanıcı bulunamadı' });
    }

    const otp = generateOTP();

    const newOtp = new Otp({
      email,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    await newOtp.save();

    await sendOTP(email, otp);

    res
      .status(200)
      .json({ message: 'OTP e-posta adresinize gönderildi', success: true });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

router.post('/verify-otp', async (req, res) => {
  const { email, otp, type } = req.body;

  try {
    const result = await verifyOtpHelper(email, otp);

    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    const { token, user } = result;

    if (type === 'login') {
      res.status(200).json({
        token,
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        success: true,
      });
      await Otp.deleteOne({ email });
    } else {
      res.status(200).json({
        success: true,
      });
      await Otp.deleteOne({ email });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();

    res
      .status(200)
      .json({ message: 'Password updated successfully', success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/verify-email/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const isBlacklisted = await tokenBlacklist.findOne({ token });

    if (isBlacklisted) {
      return res
        .status(400)
        .json({ message: 'Token has already been used or is invalid' });
    }

    const email = await verifyEmailVerificationToken(token);

    if (!email) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { isEmailVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    await tokenBlacklist.create({ token });

    res
      .status(200)
      .json({ message: 'Email verified successfully', success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
