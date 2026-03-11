const Appointment = require('../models/Appointment');
const catchAsync = require('../utils/catchAsync');
const Notification = require("../models/Notification");

exports.list = catchAsync(async (req, res) => {
  const filter = req.user.role === 'patient' ? { patientId: req.user._id } : { doctorId: req.user._id };
  const appointments = await Appointment.find(filter)
    .populate('patientId', 'name email phone')
    .populate('doctorId', 'name email specialization qualification')
    .sort({ date: 1, time: 1 });
  res.status(200).json({ success: true, appointments });
});

exports.getOne = catchAsync(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patientId', 'name email phone')
    .populate('doctorId', 'name email specialization qualification');
  if (!appointment) {
    return res.status(404).json({ success: false, message: 'Appointment not found.' });
  }
  const isParticipant =
    appointment.patientId._id.toString() === req.user._id.toString() ||
    appointment.doctorId._id.toString() === req.user._id.toString();
  if (!isParticipant) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }
  res.status(200).json({ success: true, appointment });
});

exports.create = catchAsync(async (req, res) => {

  const { doctorId, date, time } = req.body;

  const start = new Date(date);
  start.setHours(0,0,0,0);

  const end = new Date(date);
  end.setHours(23,59,59,999);

  const existingAppointment = await Appointment.findOne({
    doctorId,
    date: { $gte: start, $lte: end },
    time,
    status: { $in: ["pending","accepted"] }
  });

  if (existingAppointment) {
    return res.status(400).json({
      success: false,
      message: "This time slot is already booked."
    });
  }

  const appointment = await Appointment.create({
    patientId: req.user._id,
    doctorId,
    date: new Date(date),
    time,
    status: "pending"
  });

  res.status(201).json({
    success: true,
    appointment
  });

});

exports.updateStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const allowed = ['accepted', 'rejected', 'completed', 'cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status.' });
  }
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    return res.status(404).json({ success: false, message: 'Appointment not found.' });
  }
  if (appointment.doctorId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Only the doctor can update status.' });
  }
  appointment.status = status;
  await appointment.save();

  const io = req.app.get("io");
  io.to(`user_${appointment.patientId}`).emit("notification", {
    message: `Doctor has ${status} your appointment`
});
  const populated = await Appointment.findById(appointment._id)
    .populate('patientId', 'name email')
    .populate('doctorId', 'name specialization');
  res.status(200).json({ success: true, appointment: populated });
});

exports.getDoctorBookedSlots = catchAsync(async (req, res) => {

  const { doctorId } = req.params;
  const { date } = req.query;

  if (!doctorId || !date) {
    return res.status(400).json({
      success: false,
      message: "doctorId and date are required"
    });
  }

  const appointments = await Appointment.find({
    doctorId,
    date,
    status: { $ne: "cancelled" }
  });

  const bookedSlots = appointments.map(a => a.time);

  res.status(200).json({
    success: true,
    bookedSlots
  });

});