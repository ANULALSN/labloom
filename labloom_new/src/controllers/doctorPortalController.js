const Booking = require('../models/Booking');
const Consultation = require('../models/Consultation');
const User = require('../models/User');
const sendEmail = require('../utils/mailer');

// @desc    Get doctor's appointments
// @route   GET /api/doctor/appointments
// @access  Private (Doctor only)
const getDoctorAppointments = async (req, res) => {
    try {
        const { status, date } = req.query;

        let filter = {
            doctor: req.user.id,
            bookingType: 'doctor'
        };

        if (status) {
            filter.status = status;
        }

        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            filter.date = { $gte: startOfDay, $lte: endOfDay };
        }

        const appointments = await Booking.find(filter)
            .populate('user', 'name phone email image healthProfile lifestyle')
            .sort({ date: 1, time: 1 });

        // Map to add patientId alias for frontend compatibility
        const mapped = appointments.map(a => {
            const obj = a.toObject();
            obj.patientId = obj.user; // frontend reads a.patientId?.name
            return obj;
        });

        // Return flat array — frontend expects Array.isArray(data)
        res.json(mapped);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update appointment status
// @route   PATCH /api/appointments/:id/status
// @access  Private (Doctor only)
const updateAppointmentStatus = async (req, res) => {
    try {
        const { status, reason } = req.body;

        const appointment = await Booking.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Verify doctor owns this appointment
        if (appointment.doctor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this appointment' });
        }

        appointment.status = status;
        if (reason) {
            appointment.notes = reason;
        }

        await appointment.save();

        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get appointment details
// @route   GET /api/appointments/:id
// @access  Private (Doctor/Patient)
const getAppointmentDetails = async (req, res) => {
    try {
        const appointment = await Booking.findById(req.params.id)
            .populate('user', 'name phone email dob healthProfile emergencyContact')
            .populate('doctor', 'name doctorProfile.specialization');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Check authorization
        const isDoctor = req.user.role === 'doctor' && appointment.doctor._id.toString() === req.user.id;
        const isPatient = req.user.role === 'patient' && appointment.user._id.toString() === req.user.id;

        if (!isDoctor && !isPatient) {
            return res.status(403).json({ message: 'Not authorized to view this appointment' });
        }

        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get doctor's patient list
// @route   GET /api/doctor/patients
// @access  Private (Doctor only)
const getDoctorPatients = async (req, res) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;

        // Find all unique patients who have had appointments with this doctor
        const appointments = await Booking.find({
            doctor: req.user.id,
            bookingType: 'doctor'
        }).distinct('user');

        let filter = { _id: { $in: appointments } };

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const patients = await User.find(filter)
            .select('name phone email image dob')
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await User.countDocuments(filter);

        res.json({
            patients,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get patient medical history
// @route   GET /api/patients/:id/history
// @access  Private (Doctor only - with authorization)
const getPatientHistory = async (req, res) => {
    try {
        const patientId = req.params.id;

        // Verify doctor has treated this patient
        const hasAppointment = await Booking.findOne({
            doctor: req.user.id,
            user: patientId
        });

        if (!hasAppointment) {
            return res.status(403).json({ message: 'Not authorized to view this patient\'s history' });
        }

        // Get patient details
        const patient = await User.findById(patientId)
            .select('name phone email dob healthProfile lifestyle emergencyContact');

        // Get past consultations
        const consultations = await Consultation.find({
            patient: patientId,
            status: 'completed'
        })
            .populate('doctor', 'name doctorProfile.specialization')
            .sort({ createdAt: -1 })
            .limit(10);

        // Get past appointments
        const appointments = await Booking.find({
            user: patientId,
            bookingType: 'doctor',
            status: 'completed'
        })
            .populate('doctor', 'name doctorProfile.specialization')
            .sort({ date: -1 })
            .limit(10);

        res.json({
            patient,
            consultations,
            appointments
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Save consultation records
// @route   POST /api/consultations/:appointmentId/records
// @access  Private (Doctor only)
const saveConsultationRecords = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const consultationData = req.body;

        // Verify appointment exists and belongs to doctor
        const appointment = await Booking.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.doctor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Create or update consultation
        let consultation = await Consultation.findOne({ appointment: appointmentId });

        if (consultation) {
            // Update existing
            Object.assign(consultation, consultationData);
            consultation.updatedAt = Date.now();
        } else {
            // Create new
            consultation = await Consultation.create({
                appointment: appointmentId,
                doctor: req.user.id,
                patient: appointment.user,
                ...consultationData
            });
        }

        await consultation.save();

        res.json(consultation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Issue prescription
// @route   POST /api/consultations/:appointmentId/prescribe
// @access  Private (Doctor only)
const issuePrescription = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { prescriptions } = req.body;

        // Verify appointment
        const appointment = await Booking.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.doctor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        let prescriptionPdfUrl = null;
        if (req.file) {
            prescriptionPdfUrl = req.file.path;
        }

        // Find or create consultation
        let consultation = await Consultation.findOne({ appointment: appointmentId });

        // Normalize if single object sent instead of array
        let normPrescriptions = [];
        if (prescriptions) {
            try {
                normPrescriptions = typeof prescriptions === 'string' ? JSON.parse(prescriptions) : prescriptions;
                if (!Array.isArray(normPrescriptions)) normPrescriptions = [];
            } catch {
                normPrescriptions = [];
            }
        }

        if (!prescriptions && req.body.medications) {
            // Handle flat object from PatientList.jsx
            normPrescriptions = [{
                medication: req.body.medications,
                diagnosis: req.body.diagnosis,
                notes: req.body.notes,
                date: new Date()
            }];
        }

        if (!consultation) {
            consultation = await Consultation.create({
                appointment: appointmentId,
                doctor: req.user.id,
                patient: appointment.user,
                prescriptions: normPrescriptions,
                prescriptionPdfUrl: prescriptionPdfUrl,
                diagnosis: req.body.diagnosis // top level diagnosis if present
            });
        } else {
            consultation.prescriptions = normPrescriptions;
            if (prescriptionPdfUrl) consultation.prescriptionPdfUrl = prescriptionPdfUrl;
            if (req.body.diagnosis) consultation.diagnosis = req.body.diagnosis;
            await consultation.save();
        }

        // Also update booking's visitSummary for backward compatibility
        if (!appointment.visitSummary) {
            appointment.visitSummary = {};
        }
        appointment.visitSummary.prescriptions = normPrescriptions;
        if (prescriptionPdfUrl) appointment.visitSummary.prescriptionPdfUrl = prescriptionPdfUrl;
        appointment.visitSummary.diagnosis = req.body.diagnosis;
        await appointment.save();

        res.json({
            message: 'Prescription issued successfully',
            consultation
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get doctor's availability and fee
// @route   GET /api/doctor/availability
// @access  Private (Doctor only)
const getDoctorAvailability = async (req, res) => {
    try {
        const doctor = await User.findById(req.user.id).select('doctorProfile.availability doctorProfile.consultationFee doctorProfile.specialization name doctorProfile.verificationStatus doctorProfile.verificationDocuments');
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json({
            availability: doctor.doctorProfile?.availability || [],
            consultationFee: doctor.doctorProfile?.consultationFee || 500,
            specialization: doctor.doctorProfile?.specialization || '',
            name: doctor.name,
            verificationStatus: doctor.doctorProfile?.verificationStatus,
            verificationDocuments: doctor.doctorProfile?.verificationDocuments || []
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update doctor's availability and fee
// @route   PUT /api/doctor/availability
// @access  Private (Doctor only)
const updateDoctorAvailability = async (req, res) => {
    try {
        const { availability, consultationFee, specialization } = req.body;
        const doctor = await User.findById(req.user.id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        if (!doctor.doctorProfile) {
            doctor.doctorProfile = {};
        }
        if (availability) doctor.doctorProfile.availability = availability;
        if (consultationFee !== undefined) doctor.doctorProfile.consultationFee = consultationFee;
        if (specialization) doctor.doctorProfile.specialization = specialization;

        await doctor.save();

        res.json({
            message: 'Availability updated successfully',
            availability: doctor.doctorProfile.availability,
            consultationFee: doctor.doctorProfile.consultationFee
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get reports pending doctor verification (only for this doctor's patients)
// @route   GET /api/doctor/pending-reports
// @access  Private (Doctor only)
const getPendingReports = async (req, res) => {
    try {
        // Primary: reports explicitly assigned to this doctor via referringDoctor
        const assignedReports = await Booking.find({
            bookingType: 'test',
            'labReport.reportUrl': { $exists: true, $ne: null },
            'labReport.verifiedByDoctor': false,
            'labReport.referringDoctor': req.user.id
        })
            .populate('user', 'name phone email')
            .populate('test', 'name category')
            .populate('lab', 'name')
            .sort({ updatedAt: -1 });

        // Fallback: reports for patients this doctor has previously treated
        // (handles legacy reports uploaded before referringDoctor was tracked)
        const myPatientIds = await Booking.find({
            doctor: req.user.id,
            bookingType: 'doctor'
        }).distinct('user');

        const patientReports = await Booking.find({
            bookingType: 'test',
            'labReport.reportUrl': { $exists: true, $ne: null },
            'labReport.verifiedByDoctor': false,
            'labReport.referringDoctor': { $exists: false }, // no doctor assigned yet
            user: { $in: myPatientIds }
        })
            .populate('user', 'name phone email')
            .populate('test', 'name category')
            .populate('lab', 'name')
            .sort({ updatedAt: -1 });

        // Merge — assigned reports first, then fallback patient reports
        const allReports = [
            ...assignedReports,
            ...patientReports.filter(r => !assignedReports.find(a => a._id.equals(r._id)))
        ];

        res.json(allReports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Verify lab report and notify patient
// @route   POST /api/doctor/verify-report/:id
// @access  Private (Doctor only)
const verifyReport = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('user', 'name email')
            .populate('test', 'name')
            .populate('lab', 'name');

        if (!booking || !booking.labReport) {
            return res.status(404).json({ message: 'Report not found' });
        }

        booking.labReport.verifiedByDoctor = true;
        booking.labReport.verifiedBy = req.user.id;
        booking.labReport.status = 'Verified by Doctor';

        await booking.save();

        // Notify patient that their report is ready
        if (booking.user?.email) {
            try {
                await sendEmail({
                    email: booking.user.email,
                    subject: `Your ${booking.test?.name || 'Lab Test'} Report is Ready`,
                    message: `Dear ${booking.user.name},\n\nGreat news! Your lab test report has been reviewed and verified by a doctor.\n\nYou can view and download your report here:\n${booking.labReport.reportUrl}\n\nTest: ${booking.test?.name || 'Lab Test'}\nLab: ${booking.lab?.name || 'Labloom Partner Lab'}\n\nLog in to your Labloom account to view it anytime.\n\nThank you for choosing Labloom.`
                });
            } catch (mailErr) {
                console.error('Patient notification email error:', mailErr.message);
            }
        }

        res.json({ message: 'Report verified and patient notified successfully.', booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDoctorAppointments,
    updateAppointmentStatus,
    getAppointmentDetails,
    getDoctorPatients,
    getPatientHistory,
    saveConsultationRecords,
    issuePrescription,
    getDoctorAvailability,
    updateDoctorAvailability,
    getPendingReports,
    verifyReport
};
