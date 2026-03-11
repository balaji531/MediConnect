const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { protect, roleCheck } = require('../middleware/auth');
const { body, param, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
};

router.use(protect);

router.get('/', prescriptionController.list);
router.get('/:id', param('id').isMongoId(), validate, prescriptionController.getOne);
router.post(
  '/',
  roleCheck('doctor'),
  [
    body('patientId').isMongoId().withMessage('Valid patient ID required'),
    body('medicines').isArray({ min: 1 }).withMessage('At least one medicine required'),
    body('medicines.*.name').notEmpty().withMessage('Medicine name required'),
    body('medicines.*.dosage').notEmpty().withMessage('Dosage required'),
    body('medicines.*.duration').notEmpty().withMessage('Duration required'),
  ],
  validate,
  prescriptionController.create
);

module.exports = router;
