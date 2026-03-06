const Booking = require('../models/Booking');
const Metric = require('../models/Metric');
const Lab = require('../models/Lab');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const Review = require('../models/Review');
const Test = require('../models/Test');
const User = require('../models/User');

// @desc    Get patient dashboard summary
// @route   GET /api/patients/dashboard
// @access  Private (Patient)
const getPatientDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Upcoming appointments count
        const upcomingCount = await Booking.countDocuments({
            user: userId,
            date: { $gte: new Date() },
            status: 'pending'
        });

        // 2. Completed visits count
        const completedCount = await Booking.countDocuments({
            user: userId,
            status: 'completed'
        });

        // 3. Lab reports count
        const reportsCount = await Booking.countDocuments({
            user: userId,
            bookingType: 'test',
            status: 'completed'
        });

        // 4. Recent bookings for the list
        const recentBookings = await Booking.find({ user: userId })
            .populate('doctor', 'name doctorProfile.specialization')
            .populate('test', 'name')
            .populate('lab', 'name')
            .sort({ date: -1 })
            .limit(5);

        // 5. Prescriptions (placeholder or from consultations)
        const prescriptionsCount = 0;

        res.json({
            upcomingAppointments: upcomingCount,
            completedVisits: completedCount,
            labReports: reportsCount,
            prescriptions: prescriptionsCount,
            recentBookings,
            healthScore: 85,
            summary: "Your health score is consistent. Consider increasing water intake by 500ml daily."
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Find available labs
// @route   GET /api/labs
// @access  Public
const getLabs = async (req, res) => {
    try {
        const { city, search } = req.query;
        // Show ONLY approved labs
        let filter = { verificationStatus: 'approved' };

        if (city && city !== 'All') {
            filter['address.city'] = { $regex: city, $options: 'i' };
        }
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        const labs = await Lab.find(filter)
            .select('name address phone availableTests rating reviewsCount image registrationNumber')
            .limit(20);

        const mappedLabs = labs.map(lab => {
            const obj = lab.toObject();
            if (obj.address && typeof obj.address === 'object') {
                const parts = [obj.address.street, obj.address.city, obj.address.state].filter(Boolean);
                obj.address = parts.join(', ') || obj.address.city || obj.address.country || 'Address N/A';
            }
            return obj;
        });

        res.json(mappedLabs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Get tests for a specific lab
// @route   GET /api/patients/labs/:id/tests
// @access  Public
const getLabTests = async (req, res) => {
    try {
        const lab = await Lab.findById(req.params.id).populate({
            path: 'availableTests.testId',
            model: 'Test'
        });

        if (!lab) {
            return res.status(404).json({ message: 'Lab not found' });
        }

        // Format response to include price and turnaround from Lab specific info
        const tests = lab.availableTests.map(item => ({
            _id: item.testId?._id,
            name: item.testId?.name || 'Unknown Test',
            description: item.testId?.description,
            category: item.testId?.category,
            image: item.testId?.image,
            price: item.price, // Lab specific price
            turnaroundTime: item.turnaroundTime // Lab specific time
        }));

        const labObj = lab.toObject();
        if (labObj.address && typeof labObj.address === 'object') {
            const parts = [labObj.address.street, labObj.address.city, labObj.address.state].filter(Boolean);
            labObj.address = parts.join(', ') || labObj.address.city || labObj.address.country || 'Address N/A';
        }

        res.json({ tests, lab: labObj });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get popular hospitals
// @route   GET /api/patients/hospitals/popular
// @access  Public
const getPopularHospitals = async (req, res) => {
    try {
        const hospitals = await Hospital.find({ verificationStatus: 'approved' })
            .sort({ rating: -1, reviewsCount: -1 })
            .limit(5)
            .select('name address rating reviewsCount image departments type');

        res.json(hospitals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get available slots for a doctor
// @route   GET /api/patients/doctors/:id/slots
// @access  Public
const getDoctorSlots = async (req, res) => {
    try {
        const { date } = req.query; // Expect YYYY-MM-DD
        const doctorId = req.params.id;

        if (!date) {
            return res.status(400).json({ message: 'Date query parameter is required' });
        }

        const queryDate = new Date(date);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = days[queryDate.getDay()];

        // 1. Fetch doctor from User model
        const doctor = await User.findById(doctorId).select('doctorProfile.availability');
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // 2. Get availability config for this specific day
        const dayConfig = doctor.doctorProfile?.availability?.find(a => a.day === dayName);
        if (!dayConfig || !dayConfig.slots || dayConfig.slots.length === 0) {
            return res.json([]); // Not available on this day
        }

        // 3. Generate possible slots based on availability config (30 min intervals)
        const possibleSlots = [];
        for (const config of dayConfig.slots) {
            let [startH, startM] = config.startTime.split(':').map(Number);
            let [endH, endM] = config.endTime.split(':').map(Number);

            let current = startH * 60 + startM;
            const end = endH * 60 + endM;

            while (current < end) {
                const h = Math.floor(current / 60).toString().padStart(2, '0');
                const m = (current % 60).toString().padStart(2, '0');
                possibleSlots.push(`${h}:${m}`);
                current += 30; // 30 minute intervals
            }
        }

        // 4. Check existing bookings for this doctor on this specific day
        const nextDate = new Date(queryDate);
        nextDate.setDate(queryDate.getDate() + 1);

        const bookings = await Booking.find({
            doctor: doctorId,
            date: {
                $gte: queryDate,
                $lt: nextDate
            },
            status: { $ne: 'cancelled' }
        }).select('time');

        const bookedTimes = bookings.map(b => b.time);

        // 5. Filter available slots
        const availableSlots = possibleSlots.map(time => ({
            time,
            isAvailable: !bookedTimes.includes(time)
        }));

        res.json(availableSlots);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit feedback/review
// @route   POST /api/patients/feedback
// @access  Private
const submitFeedback = async (req, res) => {
    try {
        const { targetId, targetType, targetName, rating, comment } = req.body;
        // targetType: 'doctor', 'lab', 'hospital'

        if (!targetId || !targetType || !rating || !comment) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const reviewData = {
            user: req.user.id,
            targetType,
            targetName,
            rating,
            comment
        };

        if (targetType === 'doctor') reviewData.doctor = targetId;
        else if (targetType === 'lab') reviewData.lab = targetId;
        else if (targetType === 'hospital') reviewData.hospital = targetId;
        else return res.status(400).json({ message: 'Invalid target type' });

        const review = await Review.create(reviewData);

        // Update entity rating
        let Model;
        if (targetType === 'doctor') Model = Doctor;
        if (targetType === 'lab') Model = Lab;
        if (targetType === 'hospital') Model = Hospital;

        if (Model) {
            const reviews = await Review.find({ [targetType]: targetId });
            const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

            await Model.findByIdAndUpdate(targetId, {
                rating: avgRating,
                reviewsCount: reviews.length
            });
        }

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get reviews for an entity
// @route   GET /api/patients/reviews
// @access  Public
const getReviews = async (req, res) => {
    try {
        const { targetId, targetType } = req.query;
        let query = {};

        if (targetType === 'doctor') query.doctor = targetId;
        else if (targetType === 'lab') query.lab = targetId;
        else if (targetType === 'hospital') query.hospital = targetId;
        else return res.status(400).json({ message: 'Invalid target type' });

        const reviews = await Review.find(query)
            .populate('user', 'name firstName lastName image')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload profile image
// @route   POST /api/patients/upload-profile-image
// @access  Private
const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Construct file path
        // Assuming express.static is serving 'uploads' folder
        const imagePath = `/uploads/${req.file.filename}`;

        const user = await User.findById(req.user.id);
        if (user) {
            user.image = imagePath;
            await user.save();
        }

        res.json({
            message: 'Image uploaded successfully',
            imageUrl: imagePath
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get reviews given by the current user
// @route   GET /api/feedback/my
// @access  Private (Patient)
const getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user.id })
            .populate('doctor', 'name')
            .populate('lab', 'name')
            .populate('hospital', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reviews (for admin)
// @route   GET /api/feedback/all
// @access  Private (Admin)
const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('user', 'name')
            .populate('doctor', 'name')
            .populate('lab', 'name')
            .populate('hospital', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update patient health and lifestyle profile
// @route   PATCH /api/patients/health-profile
// @access  Private (Patient)
const updateHealthProfile = async (req, res) => {
    try {
        const { personalData, emergencyContact, healthProfile, lifestyle } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 1. Personal Data
        if (personalData) {
            user.firstName = personalData.firstName || user.firstName;
            user.lastName = personalData.lastName || user.lastName;
            user.dob = personalData.dob || user.dob;
            user.phone = personalData.phone || user.phone;
            user.email = personalData.email || user.email;
            user.city = personalData.city || user.city;
            user.address = personalData.address || user.address;
            user.name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name;
        }

        // 2. Emergency Contact
        if (emergencyContact) {
            user.emergencyContact = {
                firstName: emergencyContact.firstName || user.emergencyContact?.firstName,
                lastName: emergencyContact.lastName || user.emergencyContact?.lastName,
                relationship: emergencyContact.relationship || user.emergencyContact?.relationship,
                phone: emergencyContact.phone || user.emergencyContact?.phone,
                email: emergencyContact.email || user.emergencyContact?.email,
                city: emergencyContact.city || user.emergencyContact?.city,
                address: emergencyContact.address || user.emergencyContact?.address
            };
        }

        // 3. Health Profile
        if (healthProfile) {
            user.healthProfile = {
                ...user.healthProfile,
                ...healthProfile,
                bloodPressure: {
                    systolic: healthProfile.bloodPressure?.systolic || user.healthProfile?.bloodPressure?.systolic,
                    diastolic: healthProfile.bloodPressure?.diastolic || user.healthProfile?.bloodPressure?.diastolic
                }
            };
        }

        // 4. Lifestyle
        if (lifestyle) {
            user.lifestyle = { ...user.lifestyle, ...lifestyle };
        }

        user.isHealthProfileComplete = true;
        await user.save();

        res.json({
            message: 'Onboarding completed successfully',
            user: {
                _id: user._id,
                name: user.name,
                role: user.role,
                phone: user.phone,
                isHealthProfileComplete: user.isHealthProfileComplete,
                personalData: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    dob: user.dob,
                    city: user.city,
                    address: user.address
                },
                emergencyContact: user.emergencyContact,
                healthProfile: user.healthProfile,
                lifestyle: user.lifestyle
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || 'account data';
            return res.status(400).json({
                message: `Duplicate field error: The ${field} you entered is already registered to another account.`
            });
        }
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPatientDashboard,
    getLabs,
    getLabTests,
    getPopularHospitals,
    getDoctorSlots,
    submitFeedback,
    getReviews,
    getMyReviews,
    getAllReviews,
    updateHealthProfile,
    uploadProfileImage
};
