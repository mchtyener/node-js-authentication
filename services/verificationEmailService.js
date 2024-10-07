const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');
const dotenv = require('dotenv');
const { sendEmail } = require('../services/emailService');

dotenv.config();

const generateEmailVerificationToken = (email) => {
  return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const verifyEmailVerificationToken = async (token) => {
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    return decoded.email;
  } catch (err) {
    return null;
  }
};

const sendVerificationEmail = async (email, token) => {
  const verificationLink = `http://localhost:4200/verify-email/${token}`;

  const templatePath = path.join(
    __dirname,
    '..',
    'templates',
    'verificationEmailTemplate.html'
  );

  try {
    let emailTemplate = await fs.readFileSync(templatePath, 'utf8');
    emailTemplate = emailTemplate.replace(
      /{{verificationLink}}/g,
      verificationLink
    );

    const mailOptions = {
      to: email,
      subject: 'Please verify your email',
      html: emailTemplate,
    };

    const isEmailSent = await sendEmail(mailOptions);
    return isEmailSent;
  } catch (error) {
    console.error('Error preparing or sending verification email:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  generateEmailVerificationToken,
  verifyEmailVerificationToken,
};
