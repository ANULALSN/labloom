const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const {
    uploadDoctorDocument,
    deleteDoctorDocument,
    uploadLabDocument,
    deleteLabDocument,
    uploadPatientReport
} = require('../controllers/uploadController');

// @route   POST /api/upload/doctor-document
// @desc    Upload documents for doctor verification
// @access  Private (Doctor)
router.post('/doctor-document', protect, upload.single('document'), uploadDoctorDocument);

// @route   DELETE /api/upload/doctor-document/:docId
// @desc    Delete a doctor verification document
// @access  Private (Doctor)
router.delete('/doctor-document/:docId', protect, deleteDoctorDocument);

// @route   POST /api/upload/lab-document/:labId
// @desc    Upload documents for lab verification
// @access  Private (Lab Admin)
router.post('/lab-document/:labId', protect, upload.single('document'), uploadLabDocument);

// @route   DELETE /api/upload/lab-document/:labId/:docId
// @desc    Delete a lab verification document
// @access  Private (Lab Admin)
router.delete('/lab-document/:labId/:docId', protect, deleteLabDocument);

// @route   POST /api/upload/patient-report/:bookingId
// @desc    Upload lab report and notify patient
// @access  Private (Lab/Doctor)
router.post('/patient-report/:bookingId', protect, upload.single('report'), uploadPatientReport);

module.exports = router;
