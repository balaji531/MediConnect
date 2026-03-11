const Prescription = require('../models/Prescription');
const catchAsync = require('../utils/catchAsync');
const PDFDocument = require('pdfkit');

/* ---------- Existing controller functions ---------- */

exports.list = catchAsync(async (req, res) => {
  const filter = req.user.role === 'doctor' ? { doctorId: req.user._id } : { patientId: req.user._id };
  const prescriptions = await Prescription.find(filter)
    .populate('patientId', 'name email')
    .populate('doctorId', 'name specialization')
    .populate('appointmentId')
    .sort({ date: -1 });
  res.status(200).json({ success: true, prescriptions });
});

exports.getOne = catchAsync(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate('patientId', 'name email phone')
    .populate('doctorId', 'name email specialization qualification')
    .populate('appointmentId');
  if (!prescription) {
    return res.status(404).json({ success: false, message: 'Prescription not found.' });
  }
  const isParticipant =
    prescription.patientId._id.toString() === req.user._id.toString() ||
    prescription.doctorId._id.toString() === req.user._id.toString();
  if (!isParticipant) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }
  res.status(200).json({ success: true, prescription });
});

exports.create = catchAsync(async (req, res) => {
  const Appointment = require('../models/Appointment');

  const { patientId, appointmentId, medicines, notes } = req.body;

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return res.status(404).json({ success: false, message: 'Appointment not found' });
  }

  if (appointment.doctorId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not your appointment' });
  }

  if (appointment.status !== 'accepted' && appointment.status !== 'completed') {
    return res.status(400).json({ success: false, message: 'Appointment not completed yet' });
  }

  const prescription = await Prescription.create({
    doctorId: req.user._id,
    patientId,
    appointmentId,
    medicines,
    notes: notes || '',
    date: new Date(),
  });

  const populated = await Prescription.findById(prescription._id)
    .populate('patientId', 'name email')
    .populate('doctorId', 'name specialization');

  res.status(201).json({ success: true, prescription: populated });
});

/* ---------- NEW: Download PDF function ---------- */

exports.downloadPDF = catchAsync(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate('patientId', 'name email')
    .populate('doctorId', 'name specialization');

  if (!prescription) {
    return res.status(404).json({ success: false, message: 'Prescription not found' });
  }

  // Only doctor who created it can download
  if (prescription.doctorId._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  const doc = new PDFDocument();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=prescription-${prescription._id}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(20).text('Prescription', { align: 'center' });
  doc.moveDown();

  doc.fontSize(14).text(`Doctor: ${prescription.doctorId.name} (${prescription.doctorId.specialization})`);
  doc.text(`Patient: ${prescription.patientId.name} (${prescription.patientId.email})`);
  doc.text(`Date: ${prescription.date.toDateString()}`);
  doc.moveDown();

  doc.fontSize(16).text('Medicines:');
  prescription.medicines.forEach((med, idx) => {
    doc.fontSize(12).text(
      `${idx + 1}. ${med.name} - ${med.dosage} - ${med.duration} - ${med.instructions || 'No instructions'}`
    );
  });

  if (prescription.notes) {
    doc.moveDown();
    doc.fontSize(14).text('Notes:');
    doc.fontSize(12).text(prescription.notes);
  }

  doc.end();
});