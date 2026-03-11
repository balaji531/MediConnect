const User = require('../models/User');
const crypto = require('crypto');
const { signToken } = require('../utils/jwt');
const { sendEmail } = require('../utils/sendEmail');
const catchAsync = require('../utils/catchAsync');

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  const u = user.toObject();
  delete u.password;
  res.status(statusCode).json({ success: true, token, user: u });
};



// =============================
// PATIENT REGISTER ONLY
// =============================
exports.register = catchAsync(async (req, res) => {
  const { email, password, name, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email already registered.' });
  }

  const user = await User.create({
    email,
    password,
    name,
    role: 'patient',
    phone: phone || '',
  });

  const verificationToken = crypto.randomBytes(20).toString('hex');
  user.verificationToken = verificationToken;
  user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;
  await user.save();

  const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verifyUrl = `${frontendBase}/verify-email/${verificationToken}`;

  await sendEmail(
    email,
    'Verify your MediConnect account',
    `
    <h3>Verify your email</h3>
    <p>Hi ${name || ''},</p>
    <p>Thank you for registering with MediConnect. Please verify your email address by clicking the link below:</p>
    <a href="${verifyUrl}">${verifyUrl}</a>
    <p>This link expires in 24 hours.</p>
    `
  );

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please check your email to verify your account before logging in.',
  });
});



// =============================
// ADMIN CREATE DOCTOR
// =============================
exports.createDoctorByAdmin = catchAsync(async (req, res) => {
  const { email, name, phone, specialization, qualification, availability } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Doctor already exists.' });
  }

  const generatedPassword = Math.random().toString(36).slice(-8);

  const verificationToken = crypto.randomBytes(20).toString('hex');

  const doctor = await User.create({
    email,
    password: generatedPassword,
    name,
    role: 'doctor',
    phone: phone || '',
    specialization: specialization || '',
    qualification: qualification || '',
    availability: availability || '',
    isVerified: false,
    verificationToken,
    verificationTokenExpire: Date.now() + 24 * 60 * 60 * 1000,
  });

  const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verifyUrl = `${frontendBase}/verify-email/${verificationToken}`;

  await sendEmail(
    email,
    "Doctor Account Created",
    `
    <h3>Your MediConnect Doctor Account</h3>
    <p>Hi Dr. ${name || ''},</p>
    <p>Your account has been created. Use the credentials below to log in after verifying your email:</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Temporary Password:</strong> ${generatedPassword}</p>
    <p>Please verify your email first by clicking this link:</p>
    <a href="${verifyUrl}">${verifyUrl}</a>
    <p>After logging in, go to your profile and change your password immediately.</p>
    `
  );

  res.status(201).json({
    success: true,
    message: 'Doctor created successfully.',
  });
});



// =============================
// LOGIN
// =============================
exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.'
    });
  }

  const match = await user.comparePassword(password);

  if (!match) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.'
    });
  }

  sendTokenResponse(user, 200, res);
});

// =============================
// LIST ALL DOCTORS (ADMIN)
// =============================
exports.listAllDoctors = catchAsync(async (req, res) => {
  const doctors = await User.find({ role: 'doctor' }).select('-password');
  res.status(200).json({ success: true, doctors });
});

// =============================
// LIST ALL PATIENTS (ADMIN)
// =============================
exports.listAllPatients = catchAsync(async (req, res) => {
  const patients = await User.find({ role: 'patient' }).select('-password');

  res.status(200).json({
    success: true,
    patients
  });
});

// =============================
// DELETE DOCTOR
// =============================
exports.deleteDoctor = catchAsync(async (req, res) => {
  const doctor = await User.findById(req.params.id);

  if (!doctor || doctor.role !== 'doctor') {
    return res.status(404).json({ success: false, message: 'Doctor not found.' });
  }

  await doctor.deleteOne();

  res.status(200).json({ success: true, message: 'Doctor deleted successfully.' });
});



// =============================
// UPDATE DOCTOR
// =============================
exports.updateDoctor = catchAsync(async (req, res) => {
  const doctor = await User.findById(req.params.id);

  if (!doctor || doctor.role !== 'doctor') {
    return res.status(404).json({ success: false, message: 'Doctor not found.' });
  }

  const { name, phone, specialization, qualification, availability } = req.body;

  doctor.name = name || doctor.name;
  doctor.phone = phone || doctor.phone;
  doctor.specialization = specialization || doctor.specialization;
  doctor.qualification = qualification || doctor.qualification;
  doctor.availability = availability || doctor.availability;

  await doctor.save();

  res.status(200).json({ success: true, message: 'Doctor updated successfully.' });
});



// =============================
// FORGOT PASSWORD
// =============================
exports.forgotPassword = catchAsync(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({ success: false, message: 'No user found with this email.' });
  }

  const resetToken = crypto.randomBytes(20).toString('hex');

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save();

  const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendBase}/reset-password/${resetToken}`;

  await sendEmail(
    user.email,
    'Password Reset',
    `
    <h3>Password Reset</h3>
    <p>Click below to reset password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>This link expires in 10 minutes.</p>
    `
  );

  res.status(200).json({ success: true, message: 'Reset email sent.' });
});



// =============================
// RESET PASSWORD
// =============================
exports.resetPassword = catchAsync(async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpire: { $gt: Date.now() }
  }).select('+password');

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({ success: true, message: 'Password reset successful.' });
});


// =============================
// EMAIL VERIFICATION
// =============================
exports.verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification link.',
    });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpire = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Email verified successfully. You can now log in.',
  });
});


exports.resendVerificationEmail = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: 'No user found with this email.' });
  }

  if (user.isVerified) {
    return res.status(400).json({ success: false, message: 'Email is already verified.' });
  }

  const verificationToken = crypto.randomBytes(20).toString('hex');
  user.verificationToken = verificationToken;
  user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;
  await user.save();

  const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verifyUrl = `${frontendBase}/verify-email/${verificationToken}`;

  await sendEmail(
    user.email,
    'Verify your MediConnect account',
    `
    <h3>Verify your email</h3>
    <p>Hi ${user.name || ''},</p>
    <p>Please verify your email address by clicking the link below:</p>
    <a href="${verifyUrl}">${verifyUrl}</a>
    <p>This link expires in 24 hours.</p>
    `
  );

  res.status(200).json({
    success: true,
    message: 'Verification email resent. Please check your inbox.',
  });
});



exports.logout = (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out.' });
};



exports.getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.status(200).json({ success: true, user });
});