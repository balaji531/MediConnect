const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, roleCheck } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);

// ADMIN ROUTES
router.post('/admin/add-doctor', protect, roleCheck('admin'), authController.createDoctorByAdmin);
router.get('/admin/doctors', protect, roleCheck('admin'), authController.listAllDoctors);
router.delete('/admin/doctor/:id', protect, roleCheck('admin'), authController.deleteDoctor);
router.put('/admin/doctor/:id', protect, roleCheck('admin'), authController.updateDoctor);

// PASSWORD
router.post('/forgot-password', authController.forgotPassword);
router.put('/reset-password/:token', authController.resetPassword);

// EMAIL VERIFICATION
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerificationEmail);

router.get('/admin/patients', protect, roleCheck('admin'), authController.listAllPatients);


module.exports = router;