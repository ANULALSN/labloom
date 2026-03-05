const Doctor = require('../models/Doctor');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const User = require('../models/User');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
    try {
        // ONLY show doctors whose verification has been explicitly approved by admin
        const userDoctors = await User.find({
            role: 'doctor',
            'doctorProfile.verificationStatus': 'approved',
            isActive: { $ne: false }
        }).select('name phone email doctorProfile createdAt');

        // Normalize user-doctors to match Doctor model shape
        const normalizedUserDocs = userDoctors.map(u => ({
            _id: u._id,
            name: u.name,
            specialization: u.doctorProfile?.specialization || 'General Physician',
            rating: u.doctorProfile?.rating || 0,
            reviewsCount: u.doctorProfile?.reviewsCount || 0,
            price: u.doctorProfile?.consultationFee || 500,
            location: u.doctorProfile?.currentWorkingPlace || 'Not specified',
            phone: u.phone,
            image: u.image || 'https://img.freepik.com/free-photo/pleased-young-female-doctor-wearing-medical-robe-stethoscope-around-neck-standing-with-closed-posture_409827-254.jpg',
            _source: 'user'
        }));

        res.json(normalizedUserDocs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Search doctors by name, specialty, or hospital
// @route   GET /api/doctors/search
// @access  Public
const searchDoctors = async (req, res) => {
    try {
        const { name, specialty, hospital, page = 1, limit = 20 } = req.query;
        let filter = {};

        if (name) {
            filter.name = { $regex: name, $options: 'i' };
        }

        if (specialty) {
            filter.specialization = { $regex: specialty, $options: 'i' };
        }

        if (hospital) {
            filter.location = { $regex: hospital, $options: 'i' };
        }

        const doctors = await Doctor.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ rating: -1 });

        const count = await Doctor.countDocuments(filter);

        res.json({
            doctors,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get doctor details with reviews
// @route   GET /api/doctors/:id/details
// @access  Public
const getDoctorDetails = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Get reviews for this doctor
        const reviews = await Review.find({ doctor: req.params.id })
            .populate('user', 'name firstName lastName image')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            ...doctor.toObject(),
            reviews
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get available slots for a doctor
// @route   GET /api/doctors/:id/slots
// @access  Public
const getDoctorSlots = async (req, res) => {
    try {
        const { date } = req.query;
        const doctorId = req.params.id;

        if (!date) {
            return res.status(400).json({ message: 'Date query parameter is required (YYYY-MM-DD)' });
        }

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Also check if the doctor is a User with role='doctor' and has availability defined
        // If doctor exists in User model with availability slots, use those
        const doctorUser = await User.findOne({
            role: 'doctor',
            'doctorProfile.hospitalAffiliations': { $exists: true }
        });

        // Generate default slots (9 AM to 5 PM, 30 min intervals)
        // In production, these would come from hospital-assigned slots
        const slots = [];
        const startHour = 9;
        const endHour = 17;

        for (let i = startHour; i < endHour; i++) {
            slots.push(`${i.toString().padStart(2, '0')}:00`);
            slots.push(`${i.toString().padStart(2, '0')}:30`);
        }

        // Check existing bookings for this doctor on this date
        const queryDate = new Date(date);
        const nextDate = new Date(queryDate);
        nextDate.setDate(queryDate.getDate() + 1);

        const bookings = await Booking.find({
            doctor: doctorId,
            date: {
                $gte: queryDate,
                $lt: nextDate
            },
            status: { $nin: ['cancelled', 'test_not_done'] }
        });

        // Map booked times using the 'time' field
        const bookedTimes = bookings.map(b => b.time).filter(Boolean);

        // Also check date-based time extraction as fallback
        bookings.forEach(b => {
            if (!b.time) {
                const d = new Date(b.date);
                const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                if (!bookedTimes.includes(timeStr)) {
                    bookedTimes.push(timeStr);
                }
            }
        });

        const availableSlots = slots.map(time => ({
            time,
            isAvailable: !bookedTimes.includes(time)
        }));

        res.json(availableSlots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (doctor) {
            res.json(doctor);
        } else {
            res.status(404).json({ message: 'Doctor not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDoctors,
    searchDoctors,
    getDoctorDetails,
    getDoctorSlots,
    getDoctorById
};
