const fs = require('fs');
const path = require('path');
const User = require('../models/user');
const Otp = require('../models/otp');
const emailService = require('./emailService');
const jwtHelper = require('../helpers/jwtHelper');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (email, otp) => {
  const templatePath = path.join(
    __dirname,
    '..',
    'templates',
    'otpEmailTemplate.html'
  );
  let template = fs.readFileSync(templatePath, 'utf8');

  template = template.replace('{{otp}}', otp);

  const mailOptions = {
    to: email,
    subject: 'Your OTP Code',
    html: template,
  };

  await emailService.sendEmail(mailOptions);
};

const verifyOtpHelper = async (email, otp) => {
  const user = await User.findOne({ email });
  if (!user) {
    return { error: 'Invalid credentials' };
  }

  const storedOtp = await Otp.findOne({ email });
  if (!storedOtp || storedOtp.otp !== otp || storedOtp.expiresAt < Date.now()) {
    return { error: 'Invalid or expired OTP' };
  }

  const token = jwtHelper.generateToken(user);

  await Otp.deleteOne({ email });

  return {
    token,
    user,
  };
};

module.exports = { generateOTP, sendOTP, verifyOtpHelper };
