const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            return next();
        } catch (error) {
            console.error('### JWT Error:', error.message);
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Session expired. Please login again.' });
            }
            return res.status(401).json({ message: 'Not authorized' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin only.' });
    }
};

// Generic role authorization middleware
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Required roles: ${roles.join(', ')}`
            });
        }

        next();
    };
};

// Specific role middleware
const verifyDoctor = (req, res, next) => {
    if (req.user && req.user.role === 'doctor') {
        // Accept either doctorProfile.verificationStatus or privacyPolicyAccepted as approval
        const profileApproved = req.user.doctorProfile && req.user.doctorProfile.verificationStatus === 'approved';
        const policyApproved = req.user.privacyPolicyAccepted === true;
        if (profileApproved || policyApproved) {
            next();
        } else {
            res.status(403).json({ message: 'Access denied. Doctor account pending approval.' });
        }
    } else {
        res.status(403).json({ message: 'Access denied. Doctor only.' });
    }
};

const verifyLab = (req, res, next) => {
    if (req.user && req.user.role === 'lab') {
        if (req.user.privacyPolicyAccepted) {
            next();
        } else {
            res.status(403).json({ message: 'Access denied. Lab account pending approval.' });
        }
    } else {
        res.status(403).json({ message: 'Access denied. Lab only.' });
    }
};

const verifyHospital = (req, res, next) => {
    if (req.user && req.user.role === 'hospital') {
        if (req.user.privacyPolicyAccepted) {
            next();
        } else {
            res.status(403).json({ message: 'Access denied. Hospital account pending approval.' });
        }
    } else {
        res.status(403).json({ message: 'Access denied. Hospital only.' });
    }
};

module.exports = { protect, admin, authorizeRoles, verifyDoctor, verifyLab, verifyHospital };
