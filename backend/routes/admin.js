const express = require('express');
const router = express.Router();
const {
  listAllDoctors,
  listAllPatients,
  deleteDoctor,
  updateDoctor
} = require('../controllers/authController');

const { protect, roleCheck } = require('../middleware/auth');

// Only admin can access these
router.use(protect, roleCheck('admin'));

router.get('/doctors', listAllDoctors);
router.get('/patients', listAllPatients);
router.delete('/doctors/:id', deleteDoctor);
router.put('/doctors/:id', updateDoctor);
router.put('/doctors/:id/availability', async (req, res) => {
  try {

    const { availability } = req.body;

    const doctor = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'doctor' },
      { availability },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json({
      message: 'Availability updated',
      doctor
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;