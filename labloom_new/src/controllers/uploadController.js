const User = require('../models/User');
const Lab = require('../models/Lab');
const Hospital = require('../models/Hospital');
const Booking = require('../models/Booking');
const sendEmail = require('../utils/mailer');

/**
 * Extract Cloudinary public_id from a stored URL for deletion.
 * The public_id is the part after /upload/vXXX/ without the file extension (for images).
 * e.g. https://res.cloudinary.com/cloud/image/upload/v123/labloom_uploads/file.jpg
 *   -> labloom_uploads/file
 */
function extractCloudinaryPublicId(url) {
    if (!url) return null;
    try {
        const uploadMarker = '/upload/';
        const afterUpload = url.split(uploadMarker)[1];
        if (!afterUpload) return null;
        // Remove version prefix (v123456/) if present
        const withoutVersion = afterUpload.replace(/^v\d+\//, '');
        // Remove file extension
        const publicId = withoutVersion.replace(/\.[^/.]+$/, '');
        return publicId;
    } catch {
        return null;
    }
}

/**
 * Returns a clean display name for an uploaded file.
 * Replaces ugly auto-generated names (Cloudinary IDs, phone camera filenames).
 */
function cleanFileName(originalname, fallbackPrefix = 'Document') {
    if (!originalname) return `${fallbackPrefix} ${new Date().toLocaleDateString()}`;
    const withoutExt = originalname.replace(/\.[^/.]+$/, '');
    // If it looks like a random Cloudinary ID or just digits, use fallback
    if (/^[a-z0-9]{15,}$/i.test(withoutExt) || /^\d+$/.test(withoutExt)) {
        return `${fallbackPrefix} ${new Date().toLocaleDateString()}`;
    }
    return withoutExt.replace(/[-_]/g, ' ');
}


// @route   POST /api/upload/doctor-document
// @access  Private (Doctor)
const uploadDoctorDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a document.' });
        }

        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'doctor') {
            return res.status(403).json({ message: 'Access denied. Doctors only.' });
        }

        const documentInfo = {
            name: req.body.name || cleanFileName(req.file.originalname, 'Verification Document'),
            url: req.file.path
        };

        if (!user.doctorProfile) {
            user.doctorProfile = {};
        }

        user.doctorProfile.verificationDocuments.push(documentInfo);
        await user.save();

        res.status(200).json({
            message: 'Doctor document uploaded successfully for verification.',
            document: documentInfo
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a doctor verification document
// @route   DELETE /api/upload/doctor-document/:docId
// @access  Private (Doctor)
const deleteDoctorDocument = async (req, res) => {
    try {
        const { cloudinary } = require('../config/cloudinary');
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'doctor') {
            return res.status(403).json({ message: 'Access denied. Doctors only.' });
        }

        const doc = user.doctorProfile?.verificationDocuments?.id(req.params.docId);
        if (!doc) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        // Delete from Cloudinary (best effort — don't fail if this errors)
        try {
            const publicId = extractCloudinaryPublicId(doc.url);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
            }
        } catch (cloudErr) {
            console.error('Cloudinary delete warning:', cloudErr.message);
        }

        // Remove from MongoDB
        user.doctorProfile.verificationDocuments.pull({ _id: req.params.docId });
        await user.save();

        res.status(200).json({ message: 'Document deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload documents for lab verification
// @route   POST /api/upload/lab-document/:labId
// @access  Private (Lab Admin/Staff)
const uploadLabDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a document.' });
        }

        const lab = await Lab.findById(req.params.labId);
        if (!lab) {
            return res.status(404).json({ message: 'Lab not found.' });
        }

        const documentInfo = {
            name: req.body.name || cleanFileName(req.file.originalname, 'Lab Document'),
            url: req.file.path
        };

        lab.verificationDocuments.push(documentInfo);
        await lab.save();

        res.status(200).json({
            message: 'Lab document uploaded successfully.',
            document: documentInfo
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a lab verification document
// @route   DELETE /api/upload/lab-document/:labId/:docId
// @access  Private (Lab Admin/Staff)
const deleteLabDocument = async (req, res) => {
    try {
        const { cloudinary } = require('../config/cloudinary');
        const lab = await Lab.findById(req.params.labId);
        if (!lab) {
            return res.status(404).json({ message: 'Lab not found.' });
        }

        const doc = lab.verificationDocuments?.id(req.params.docId);
        if (!doc) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        // Delete from Cloudinary (best effort)
        try {
            const publicId = extractCloudinaryPublicId(doc.url);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
            }
        } catch (cloudErr) {
            console.error('Cloudinary delete warning:', cloudErr.message);
        }

        // Remove from MongoDB
        lab.verificationDocuments.pull({ _id: req.params.docId });
        await lab.save();

        res.status(200).json({ message: 'Document deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload documents for hospital verification
// @route   POST /api/upload/hospital-document/:hospitalId
// @access  Private (Hospital Admin)
const uploadHospitalDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a document.' });
        }

        const hospital = await Hospital.findById(req.params.hospitalId);
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found.' });
        }

        const documentInfo = {
            name: req.body.name || cleanFileName(req.file.originalname, 'Hospital Document'),
            url: req.file.path
        };

        hospital.verificationDocuments.push(documentInfo);
        await hospital.save();

        res.status(200).json({
            message: 'Hospital document uploaded successfully.',
            document: documentInfo
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a hospital verification document
// @route   DELETE /api/upload/hospital-document/:hospitalId/:docId
// @access  Private (Hospital Admin)
const deleteHospitalDocument = async (req, res) => {
    try {
        const { cloudinary } = require('../config/cloudinary');
        const hospital = await Hospital.findById(req.params.hospitalId);
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found.' });
        }

        const doc = hospital.verificationDocuments?.id(req.params.docId);
        if (!doc) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        // Delete from Cloudinary (best effort)
        try {
            const publicId = extractCloudinaryPublicId(doc.url);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
            }
        } catch (cloudErr) {
            console.error('Cloudinary delete warning:', cloudErr.message);
        }

        // Remove from MongoDB
        hospital.verificationDocuments.pull({ _id: req.params.docId });
        await hospital.save();

        res.status(200).json({ message: 'Document deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload patient lab report and notify them
// @route   POST /api/upload/patient-report/:bookingId
// @access  Private (Lab/Doctor)
const uploadPatientReport = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload the patient report.' });
        }

        const booking = await Booking.findById(req.params.bookingId).populate('user', 'name email');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        booking.labReport = {
            reportUrl: req.file.path,
            status: 'Completed',
            resultDate: new Date(),
            verifiedByDoctor: req.user.role === 'doctor',
            verifiedBy: req.user.id
        };

        booking.visitSummary = booking.visitSummary || {};
        if (!booking.visitSummary.examinations) booking.visitSummary.examinations = [];

        booking.visitSummary.examinations.push({
            testName: req.body.testName || 'Lab Test',
            date: new Date(),
            status: 'Completed',
            resultUrl: req.file.path
        });

        booking.status = 'completed';
        await booking.save();

        if (booking.user.email) {
            try {
                const message = `Dear ${booking.user.name},\n\nYour recent lab report/test results have been uploaded.\n\nYou can view and download it here: ${req.file.path}\n\nThank you for choosing Labloom.`;
                await sendEmail({
                    email: booking.user.email,
                    subject: 'Your Labloom Test Report is Ready',
                    message: message
                });
            } catch (err) {
                console.error('Email could not be sent', err);
            }
        }

        res.status(200).json({
            message: 'Report uploaded and patient notified successfully.',
            reportUrl: req.file.path
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadDoctorDocument,
    deleteDoctorDocument,
    uploadLabDocument,
    deleteLabDocument,
    uploadHospitalDocument,
    deleteHospitalDocument,
    uploadPatientReport
};
