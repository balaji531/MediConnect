const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const { protect, roleCheck } = require('../middleware/auth');


// Patient sees doctors
router.get('/doctors', protect, roleCheck('patient'), userController.listDoctors);

// Doctor sees patients
router.get('/', protect, roleCheck('doctor'), userController.listPatients);

// Admin create doctor
router.post('/admin/add-doctor', protect, roleCheck('admin'), authController.createDoctorByAdmin);

// Admin list doctors
router.get('/admin/doctors', protect, roleCheck('admin'), authController.listAllDoctors);

// Admin delete doctor
router.delete('/admin/doctor/:id', protect, roleCheck('admin'), authController.deleteDoctor);

// Admin update doctor
router.put('/admin/doctor/:id', protect, roleCheck('admin'), authController.updateDoctor);

module.exports = router;