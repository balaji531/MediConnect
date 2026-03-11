const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect, roleCheck } = require('../middleware/auth');
const { body, param, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
};

router.use(protect);

router.get('/', appointmentController.list);
router.get('/:id', param('id').isMongoId(), validate, appointmentController.getOne);
router.get("/doctor-slots/:doctorId", async (req, res) => {

  try {

    const { doctorId } = req.params;
    const { date } = req.query;

    const start = new Date(date);
    start.setHours(0,0,0,0);

    const end = new Date(date);
    end.setHours(23,59,59,999);

    const appointments = await Appointment.find({
  doctorId,
  date: { $gte: start, $lte: end },
  status: { $in: ["pending", "accepted"] }
});

    const bookedSlots = appointments.map(a => a.time);

    res.json({ bookedSlots });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

});
router.post(
  '/',
  roleCheck('patient'),
  [
    body('doctorId').isMongoId().withMessage('Valid doctor ID required'),
    body('date').notEmpty().withMessage('Date required'),
    body('time').notEmpty().trim().withMessage('Time required'),
  ],
  validate,
  appointmentController.create
);
router.patch(
  '/:id/status',
  roleCheck('doctor'),
  param('id').isMongoId(),
  body('status').isIn(['accepted', 'rejected', 'completed', 'cancelled']),
  validate,
  appointmentController.updateStatus
);

module.exports = router;
