const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');

exports.listDoctors = catchAsync(async (req, res) => {
  const { search, specialization } = req.query;
  const filter = { role: 'doctor' };
  if (specialization) filter.specialization = new RegExp(specialization, 'i');
  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { specialization: new RegExp(search, 'i') },
    ];
  }
  const doctors = await User.find(filter).select('name email specialization qualification availability').lean();
  res.status(200).json({ success: true, doctors });
});

exports.updateDoctor = async (req, res) => {
  const doctor = await User.findById(req.params.id);

  if (!doctor || doctor.role !== 'doctor') {
    return res.status(404).json({ success: false, message: 'Doctor not found' });
  }

  const { name, phone, specialization, qualification, availability } = req.body;

  doctor.name = name || doctor.name;
  doctor.phone = phone || doctor.phone;
  doctor.specialization = specialization || doctor.specialization;
  doctor.qualification = qualification || doctor.qualification;
  doctor.availability = availability || doctor.availability;

  await doctor.save();

  res.status(200).json({ success: true, message: 'Doctor updated successfully' });
};

exports.deleteDoctor = async (req, res) => {
  const doctor = await User.findById(req.params.id);

  if (!doctor || doctor.role !== 'doctor') {
    return res.status(404).json({ success: false, message: 'Doctor not found' });
  }

  await doctor.deleteOne();

  res.status(200).json({ success: true, message: 'Doctor deleted successfully' });
};

exports.listPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('name email _id');
    res.json({ users: patients });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch patients' });
  }
};
